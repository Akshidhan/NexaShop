# Stripe Payment Testing Guide

## Test Card Numbers

You can use the following test card numbers to simulate different payment scenarios:

### Successful Payments
- Card Number: **4242 4242 4242 4242**
- Expiry: Any future date (MM/YY format)
- CVC: Any 3 digits
- ZIP: Any 5 digits

### Failed Payments
- Card Number: **4000 0000 0000 0002** (Generic decline)
- Card Number: **4000 0000 0000 9995** (Insufficient funds)
- Card Number: **4000 0000 0000 9979** (Stolen card)

### Authentication Required
- Card Number: **4000 0025 0000 3155** (Requires 3D Secure authentication)

## Testing Steps

1. Go to the checkout page and proceed to payment
2. Enter any of the test card numbers above
3. For the expiration date, enter any future date (e.g., 12/28)
4. For the CVC, enter any 3 digits (e.g., 123)
5. For the ZIP code, enter any 5 digits (e.g., 12345)
6. Complete the payment to see the result

## Notes

- These test cards only work in Stripe's test mode
- No real charges will be made
- The behavior of these cards simulates real payment scenarios
