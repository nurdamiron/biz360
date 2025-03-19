// src/sections/account/view/account-socials-view.jsx

import { _employeeAbout } from 'src/_mock';

import { AccountSocials } from '../account-socials';

// ----------------------------------------------------------------------

export function AccountSocialsView() {
  return <AccountSocials socialLinks={_employeeAbout.socialLinks} />;
}
