/**
 * Formats a number as Argentine Pesos (ARS)
 * Example: 1800 -> "$ 1800.00"
 */
export const formatCurrency = (amount: number): string => {
    return `$ ${amount.toFixed(2)}`;
};
