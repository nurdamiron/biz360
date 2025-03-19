// src/sections/account/view/account-billing-view.jsx

import { _employeePlans, _employeePayment, _employeeInvoices, _employeeAddressBook } from 'src/_mock';

import { AccountBilling } from '../account-billing';

// ----------------------------------------------------------------------

export function AccountBillingView() {
  return (
    <AccountBilling
      plans={_employeePlans}
      cards={_employeePayment}
      invoices={_employeeInvoices}
      addressBook={_employeeAddressBook}
    />
  );
}
