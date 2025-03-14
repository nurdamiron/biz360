// src/utils/bonusCalculator.js

/**
 * Constants for bonus calculation
 */
export const BASE_BONUS_PERCENTAGE = 5; // 5% of base price as initial bonus value

/**
 * Formats a number with specified decimal places
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {number} - Formatted number
 */
export const formatNumber = (value, decimals = 2) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return 0;
  }
  return parseFloat(value.toFixed(decimals));
};

/**
 * Safely converts a value to a number
 * @param {any} value - Value to convert
 * @param {number} defaultValue - Default value if conversion fails (default: 0)
 * @returns {number} - Converted number or default value
 */
export const safeNumber = (value, defaultValue = 0) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const number = Number(value);
  return isNaN(number) ? defaultValue : number;
};

/**
 * Calculates bonus and margin for a single order item according to the formula:
 * 1. Base bonus = basePrice * BASE_BONUS_PERCENTAGE / 100
 * 2. Actual bonus = baseBonus * (unitPrice / basePrice)
 * 3. Total bonus = actualBonus * quantity
 * 
 * @param {number} basePrice - Base/fixed price of the item
 * @param {number} unitPrice - Selling price of the item
 * @param {number} quantity - Quantity of the item
 * @returns {Object} - Calculated values including bonus, margin percentage
 */
export const calculateItemBonusAndMargin = (basePrice, unitPrice, quantity) => {
  // Convert inputs to safe numbers
  const base = safeNumber(basePrice);
  const price = safeNumber(unitPrice);
  const qty = safeNumber(quantity, 1);
  
  // Initialize default return values
  const result = {
    bonus: 0,
    marginPercentage: 0,
    priceDifference: 0,
    marginTotal: 0,
    isNegativeMargin: false,
    baseBonus: 0
  };
  
  // Check for valid values
  if (base <= 0 || price <= 0 || qty <= 0) {
    return result;
  }
  
  // Step 1: Calculate base bonus (5% of base price)
  const baseBonus = base * (BASE_BONUS_PERCENTAGE / 100);
  
  // Step 2: Adjust bonus proportionally to the selling price
  const adjustedBonus = baseBonus * (price / base);
  
  // Step 3: Calculate total bonus for the quantity
  const totalBonus = Math.round(adjustedBonus * qty);
  
  // Calculate margin percentage for information purposes
  const priceDifference = price - base;
  const marginPercentage = (priceDifference / base) * 100;
  const marginTotal = priceDifference * qty;
  
  return {
    bonus: totalBonus,
    marginPercentage: formatNumber(marginPercentage, 1),
    priceDifference: formatNumber(priceDifference, 2),
    marginTotal: formatNumber(marginTotal, 2),
    isNegativeMargin: marginPercentage < 0,
    baseBonus: formatNumber(baseBonus, 2)
  };
};

/**
 * Calculates bonuses and margins for all order items
 * @param {Array} items - Array of order items
 * @returns {Object} - Summary of bonuses and margins for the entire order
 */
export const calculateOrderBonuses = (items = []) => {
  if (!items || !items.length) {
    return {
      totalBonus: 0,
      avgMarginPercentage: 0,
      totalMargin: 0,
      itemsWithBonus: 0
    };
  }
  
  let totalBonus = 0;
  let totalMarginPercentage = 0;
  let totalMargin = 0;
  let itemsWithBonus = 0;
  
  // Process each item
  items.forEach(item => {
    // Extract values from item
    const basePrice = safeNumber(item.base_price);
    const unitPrice = safeNumber(item.unit_price);
    const quantity = safeNumber(item.quantity, 1);
    
    // Skip items with invalid values
    if (basePrice <= 0 || unitPrice <= 0) {
      return;
    }
    
    // Calculate bonus and margin for this item
    const { 
      bonus, 
      marginPercentage, 
      marginTotal 
    } = calculateItemBonusAndMargin(basePrice, unitPrice, quantity);
    
    // Add to running totals
    totalBonus += bonus;
    totalMargin += marginTotal;
    
    // Only count items with valid margins for the average
    if (basePrice > 0 && unitPrice > 0) {
      totalMarginPercentage += marginPercentage;
      itemsWithBonus++;
    }
  });
  
  // Calculate average margin percentage
  const avgMarginPercentage = itemsWithBonus > 0 
    ? formatNumber(totalMarginPercentage / itemsWithBonus, 1) 
    : 0;
  
  return {
    totalBonus,
    avgMarginPercentage,
    totalMargin: formatNumber(totalMargin, 2),
    itemsWithBonus
  };
};

/**
 * Checks if a product price is lower than its base price
 * @param {number} basePrice - Base/fixed price
 * @param {number} unitPrice - Selling price
 * @returns {boolean} - True if price is too low
 */
export const isPriceTooLow = (basePrice, unitPrice) => {
  const base = safeNumber(basePrice);
  const price = safeNumber(unitPrice);
  
  return base > 0 && price > 0 && price < base;
};

/**
 * Simulates metrics impact based on order data (for OrderMetricsPreview)
 * @param {number} totalBonus - Total potential bonus
 * @param {number} avgMargin - Average margin percentage
 * @param {number} orderTotal - Order total amount
 * @returns {Object} - Simulated metrics data
 */
export const simulateMetricsImpact = (totalBonus, avgMargin, orderTotal) => {
  // Base metrics (could be loaded from API in a real implementation)
  const currentMetrics = {
    kpi: 65,
    workVolume: 70,
    activity: 75,
    overallPerformance: 68
  };
  
  // Calculate impact factors
  const bonusImpact = Math.min(15, totalBonus / 200);
  const valueImpact = Math.min(10, (orderTotal / 10000));
  const marginImpact = Math.min(5, (avgMargin / 10));
  
  // Calculate projected values with limits
  const projectedMetrics = {
    kpi: Math.min(100, currentMetrics.kpi + bonusImpact),
    workVolume: Math.min(100, currentMetrics.workVolume + bonusImpact * 1.2 + valueImpact),
    activity: Math.min(100, currentMetrics.activity + bonusImpact * 0.8 + marginImpact),
    overallPerformance: Math.min(100, currentMetrics.overallPerformance + bonusImpact + marginImpact * 0.5)
  };
  
  // Calculate impact differences
  const impact = {
    kpi: formatNumber(projectedMetrics.kpi - currentMetrics.kpi, 1),
    workVolume: formatNumber(projectedMetrics.workVolume - currentMetrics.workVolume, 1),
    activity: formatNumber(projectedMetrics.activity - currentMetrics.activity, 1),
    overallPerformance: formatNumber(
      projectedMetrics.overallPerformance - currentMetrics.overallPerformance, 
      1
    )
  };
  
  return {
    current: currentMetrics,
    projected: projectedMetrics,
    impact
  };
};

/**
 * Validate and verify bonus calculation for a test case
 * @param {number} basePrice - Base price
 * @param {number} sellPrice - Selling price
 * @param {number} quantity - Quantity
 * @returns {Object} - Calculation details for debugging
 */
export const testBonusCalculation = (basePrice, sellPrice, quantity) => {
  // Base bonus (5% of base price)
  const baseBonus = basePrice * 0.05;
  
  // Adjusted bonus proportional to selling price
  const adjustedBonus = baseBonus * (sellPrice / basePrice);
  
  // Total bonus for all units
  const totalBonus = Math.round(adjustedBonus * quantity);
  
  // Margin calculation
  const margin = sellPrice - basePrice;
  const marginPercentage = (margin / basePrice) * 100;
  
  return {
    basePrice,
    sellPrice,
    quantity,
    baseBonus,
    adjustedBonus,
    totalBonus,
    marginPercentage: formatNumber(marginPercentage, 1)
  };
};