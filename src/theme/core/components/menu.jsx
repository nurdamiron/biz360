// ----------------------------------------------------------------------

const MuiMenuItem = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: { root: ({ theme }) => ({ ...theme.mixins.menuItemStyles(theme) }) },
};

// ----------------------------------------------------------------------

export const menu = { MuiMenuItem };