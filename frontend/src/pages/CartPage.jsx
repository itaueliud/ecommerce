import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, formatMoney } from "../utils/catalog.js";
import { applyProductImageFallback, getProductImage } from "../utils/productImage.js";

const checkoutSteps = ["address", "delivery", "payment", "review", "confirmation"];
const countyFees = {
  Nairobi: 250,
  Kiambu: 300,
  Machakos: 350,
  Kajiado: 350,
  Mombasa: 500,
  Nakuru: 450,
  Kisumu: 500,
  "Uasin Gishu": 550
};

const counties = ["Nairobi", "Kiambu", "Machakos", "Kajiado", "Mombasa", "Nakuru", "Kisumu", "Uasin Gishu"];

export default function CartPage({
  cart,
  onQtyChange,
  currentUser,
  onRequireAccount,
  onOrderConfirmed,
  onCloseCart
}) {
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [receipt, setReceipt] = useState(null);
  const [checkoutStatus, setCheckoutStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [address, setAddress] = useState({
    fullName: currentUser?.full_name || "",
    phone: currentUser?.phone || "",
    county: "Nairobi",
    town: "",
    details: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("mpesa");

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.qty, 0), [cart]);
  const deliveryFee = countyFees[address.county] || 600;
  const total = subtotal + (isCheckingOut ? deliveryFee : 0);
  const displayedTotal = receipt?.total ?? total;
  const activeStep = checkoutSteps[stepIndex];

  function beginCheckout() {
    if (!cart.length) return;
    if (!currentUser) {
      onRequireAccount();
      return;
    }
    setIsCheckingOut(true);
    setStepIndex(0);
    setReceipt(null);
    setCheckoutStatus("");
    setAddress((currentAddress) => ({
      ...currentAddress,
      fullName: currentAddress.fullName || currentUser.full_name || "",
      phone: currentAddress.phone || currentUser.phone || ""
    }));
  }

  function goNext() {
    if (activeStep === "confirmation") {
      confirmOrder();
      return;
    }
    setStepIndex((index) => Math.min(index + 1, checkoutSteps.length - 1));
  }

  function goBack() {
    if (isCheckingOut && stepIndex > 0) {
      setStepIndex((index) => Math.max(index - 1, 0));
      return;
    }
    navigate(-1);
  }

  function updateAddress(field, value) {
    setAddress((currentAddress) => ({ ...currentAddress, [field]: value }));
  }

  async function confirmOrder() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setCheckoutStatus("Submitting your order...");

    try {
      const token = currentUser?.token;
      const orderResponse = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            product_id: item._id,
            quantity: item.qty
          })),
          delivery_address: {
            full_name: address.fullName,
            phone: address.phone,
            county: address.county,
            town: address.town,
            details: address.details
          }
        })
      });
      const order = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(order.message || "Order creation failed");

      const paymentResponse = await fetch(`${API_BASE}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          order_id: order._id,
          method: paymentMethod === "mpesa" ? "mpesa" : "cash_on_delivery"
        })
      });
      const payment = await paymentResponse.json();
      if (!paymentResponse.ok) throw new Error(payment.message || "Payment setup failed");

      const newReceipt = {
        orderNumber: order.order_number,
        order,
        payment,
        total: order.total_amount,
        paymentMethod: paymentMethod === "mpesa" ? "M-Pesa" : "Cash on delivery"
      };

      setReceipt(newReceipt);
      setCheckoutStatus("Order saved to the backend.");
      onOrderConfirmed(newReceipt);
    } catch (error) {
      setCheckoutStatus(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetCheckout() {
    setIsCheckingOut(false);
    setStepIndex(0);
    setReceipt(null);
    setCheckoutStatus("");
    onCloseCart?.();
  }

  function canContinue() {
    if (activeStep !== "address") return true;
    return address.fullName.trim() && address.phone.trim() && address.county && address.town.trim() && address.details.trim();
  }

  return (
    <main>
      <section className="content-row container page-panel cart-page">
        <button className="back-btn cart-back" type="button" onClick={goBack}>
          ← My Cart
        </button>

        <div className="cart-page-shell">
          <div className="cart-page-items">
            <div className="cart-page-head">
              <h2>Your cart</h2>
              <span>{cart.length} items</span>
            </div>

            {!isCheckingOut ? (
              <>
                <div className="cart-items cart-items-page">
                  {!cart.length ? (
                    <p>Your cart is empty. Add FMCG products to start a stock order.</p>
                  ) : (
                    cart.map((item) => (
                      <div className="cart-line cart-line-page" key={item._id}>
                        <img src={getProductImage(item)} alt={item.name} onError={(event) => applyProductImageFallback(event, item)} />
                        <div>
                          <strong>{item.name}</strong>
                          <span>
                            {formatMoney(item.price)} - {item.unit_size || item.unit}
                          </span>
                        </div>
                        <div className="qty-control">
                          <button type="button" onClick={() => onQtyChange(item._id, -1)}>
                            -
                          </button>
                          <span>{item.qty}</span>
                          <button type="button" onClick={() => onQtyChange(item._id, 1)}>
                            +
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="cart-summary cart-summary-page">
                  <div>
                    <span>Subtotal</span>
                    <strong>{formatMoney(subtotal)}</strong>
                  </div>
                  <button type="button" disabled={!cart.length} onClick={beginCheckout}>
                    Checkout
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="checkout-body cart-page-checkout">
                  <div className="checkout-steps" aria-label="Checkout progress">
                    {checkoutSteps.map((step, index) => (
                      <span className={index <= stepIndex ? "active" : ""} key={step}>
                        {index + 1}
                      </span>
                    ))}
                  </div>

                  {activeStep === "address" && (
                    <section className="checkout-panel">
                      <h3>Verify address details</h3>
                      <label>
                        Full name
                        <input value={address.fullName} onChange={(event) => updateAddress("fullName", event.target.value)} />
                      </label>
                      <label>
                        Phone
                        <input value={address.phone} onChange={(event) => updateAddress("phone", event.target.value)} />
                      </label>
                      <label>
                        County
                        <select value={address.county} onChange={(event) => updateAddress("county", event.target.value)}>
                          {counties.map((county) => (
                            <option value={county} key={county}>
                              {county}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Town / area
                        <input value={address.town} onChange={(event) => updateAddress("town", event.target.value)} />
                      </label>
                      <label>
                        Building, road, or landmark
                        <textarea value={address.details} onChange={(event) => updateAddress("details", event.target.value)} />
                      </label>
                    </section>
                  )}

                  {activeStep === "delivery" && (
                    <section className="checkout-panel">
                      <h3>Delivery method</h3>
                      <div className="choice-card selected">
                        <strong>Doorstep delivery</strong>
                        <span>Delivered to {address.town || "your address"} in {address.county}.</span>
                        <b>{formatMoney(deliveryFee)}</b>
                      </div>
                    </section>
                  )}

                  {activeStep === "payment" && (
                    <section className="checkout-panel">
                      <h3>Payment method</h3>
                      <button
                        className={`choice-card${paymentMethod === "mpesa" ? " selected" : ""}`}
                        type="button"
                        onClick={() => setPaymentMethod("mpesa")}
                      >
                        <strong>M-Pesa</strong>
                        <span>Paybill 247247, account 0710292540.</span>
                      </button>
                      <button
                        className={`choice-card${paymentMethod === "cod" ? " selected" : ""}`}
                        type="button"
                        onClick={() => setPaymentMethod("cod")}
                      >
                        <strong>Cash on delivery</strong>
                        <span>Withhold payment until the physical item is in your hands.</span>
                      </button>
                    </section>
                  )}

                  {activeStep === "review" && (
                    <section className="checkout-panel">
                      <h3>Final review</h3>
                      <div className="review-lines">
                        <span>Items subtotal</span>
                        <strong>{formatMoney(subtotal)}</strong>
                        <span>Doorstep delivery</span>
                        <strong>{formatMoney(deliveryFee)}</strong>
                        <span>Final total</span>
                        <strong>{formatMoney(total)}</strong>
                      </div>
                    </section>
                  )}

                  {activeStep === "confirmation" && (
                    <section className="checkout-panel">
                      <h3>Order confirmation</h3>
                      {receipt ? (
                        <div className="receipt-card">
                          <span>Receipt generated</span>
                          <strong>{receipt.orderNumber}</strong>
                          <p>Order is saved in your account. Keep this order number for tracking.</p>
                        </div>
                      ) : (
                        <p>Click confirm order to save it, reserve stock, and create a payment record.</p>
                      )}
                      {checkoutStatus && <p>{checkoutStatus}</p>}
                    </section>
                  )}
                </div>

                <div className="cart-summary checkout-actions cart-summary-page">
                  <div>
                    <span>Final total</span>
                    <strong>{formatMoney(displayedTotal)}</strong>
                  </div>
                  {receipt ? (
                    <button type="button" onClick={resetCheckout}>
                      Done
                    </button>
                  ) : (
                    <div className="checkout-buttons">
                      {stepIndex > 0 && (
                        <button className="secondary-checkout" type="button" onClick={() => setStepIndex((index) => Math.max(index - 1, 0))}>
                          Back
                        </button>
                      )}
                      <button type="button" disabled={!canContinue() || isSubmitting} onClick={goNext}>
                        {activeStep === "confirmation" ? (isSubmitting ? "Confirming..." : "Confirm order") : "Next"}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <aside className="cart-page-receipt">
            <div className="receipt-card receipt-card-page">
              <span>Danaba Mart - Receipt</span>
              {cart.length ? (
                cart.map((item) => (
                  <div className="receipt-line" key={item._id}>
                    <span>
                      {item.name} x {item.qty}
                    </span>
                    <strong>{formatMoney(item.price * item.qty)}</strong>
                  </div>
                ))
              ) : (
                <p>Add items to see the receipt preview.</p>
              )}
              <div className="receipt-total">
                <span>Total</span>
                <strong>{formatMoney(displayedTotal)}</strong>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
