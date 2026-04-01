function validateCustomer(customer) {
  if (!customer.customer_name || typeof customer.customer_name !== 'string') {
    return { valid: false, message: 'Invalid or missing name' };
  }
  return { valid: true };
}

export default validateCustomer;