/**
 * Checks if a user is signed in by looking for the customer ID in localStorage
 * @returns {boolean} True if the user is signed in, false otherwise
 */
export const isUserSignedIn = (): boolean => {
  const customerId = localStorage.getItem('c_id');
  return !!customerId;
};
