// src/utils/nav-helper.js

/**
 * Filters navigation data based on user role and department
 * @param {object} user - The user object from auth context
 * @param {array} navData - The complete navigation data array
 * @returns {array} - Filtered navigation data
 */
export function getFilteredNavData(user, navData) {
    // If no user or navigation data, return original data
    if (!user || !navData) return navData;
    
    // Extract role and department from user object
    const role = user.employee?.role;
    
    // For owner/admin, always return the full navigation
    if (role === 'owner' || role === 'admin') {
      return navData;
    }
    
    // Continue with filtering logic for other roles...
    const department = user.employee?.department;
    
    // If no department (shouldn't happen), return original data
    if (!department) return navData;
    
    // Define permissions per department
    const departmentPermissions = {
      sales: ['ecommerce', 'product', 'order', 'invoice'],
      logistics: ['course', 'order'],
      accounting: ['banking', 'invoice'],
      manufacture: ['file', 'product']
    };
    
    // Get allowed sections for this department
    const allowedSections = departmentPermissions[department] || [];
    
    // Filter the navigation data
    return navData.map(navSection => {
      // Filter items in each section
      const filteredItems = navSection.items.filter(item => {
        // Always allow common tools (calendar, file manager, etc.)
        if (
          item.path.includes('/calendar') || 
          item.path.includes('/file-manager') || 
          item.path.includes('/kanban') ||
          item.path.includes('/post') ||
          item.path.includes('/job')
        ) {
          return true;
        }
        
        // For department heads, allow employee management
        if (role === 'head' && item.path.includes('/employee')) {
          return true;
        }
        
        // Check if item is allowed for this department
        return allowedSections.some(sectionPath => item.path.includes(sectionPath));
      });
      
      // Return section with filtered items
      return {
        ...navSection,
        items: filteredItems
      };
    }).filter(navSection => navSection.items.length > 0); // Remove empty sections
  }