/** One entry of the customer's address book (GET /users/addresses). */
export type SavedAddress = {
  _id: string;
  label: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export type AddressInput = Omit<SavedAddress, '_id'>;

/** Matches the server's limit (server/src/modules/users/addresses.service.ts). */
export const maxSavedAddresses = 10;
