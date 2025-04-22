import { useMemo } from "react";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"; // Assuming "./ui/card" is correct path
import { storage, Transaction, Category } from "@/lib/storage"; // Import full types
import { formatCurrency } from "@/lib/currency";
import { ResponsivePie } from "@nivo/pie";
// Optional: Import a loading spinner component if you have one
// import { LoadingSpinner } from "./ui/loading-spinner";

interface DashboardAnalyticsProps {
  className?: string;
}

// Helper type for the data structure used by the pie chart
interface PieChartData {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
}

export function DashboardAnalytics({ className }: DashboardAnalyticsProps) {
  // --- Fetch Data using useQuery ---
  const {
    data: transactions = [], // Default to empty array
    isLoading: isLoadingTransactions, // Get loading state
    isError: isErrorTransactions,     // Get error state
    // error: transactionsError        // Optional: get error object if needed for specific messages
  } = useQuery<Transaction[]>({ // Use imported Transaction type
    queryKey: ['transactions'], // Cache key for transactions
    queryFn: storage.getTransactions, // Fetch function
     // Removed initialData: [], as default destructuring and loading state handle this
  });

  const {
    data: categories = [], // Default to empty array
    isLoading: isLoadingCategories, // Get loading state
    isError: isErrorCategories,     // Get error state
    // error: categoriesError
  } = useQuery<Category[]>({ // Use imported Category type
    queryKey: ['categories'], // Cache key for categories
    queryFn: storage.getCategories, // Fetch function
     // Removed initialData: []
  });

  // --- Calculate Analytics using useMemo (runs only when data changes) ---
  const { spendingByCategory, totalSpending } = useMemo(() => {
    console.log("[DashboardAnalytics] Recalculating analytics..."); // For debugging

    // If data isn't loaded yet (though covered by isLoading), return default
    if (!transactions || !categories) {
        return { spendingByCategory: [], totalSpending: 0 };
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0); // Set to start of the day

    // Filter transactions for the last 30 days
    const recentTransactions = transactions.filter((transaction) => { // Use full Transaction type
      try {
        const transactionDate = new Date(transaction.date);
        // Add basic validation for date object if needed
        return !isNaN(transactionDate.getTime()) && transactionDate >= thirtyDaysAgo;
      } catch (e) {
          console.warn("Error parsing transaction date:", transaction.date, e);
          return false; // Exclude transactions with invalid dates
      }
    });

    // Calculate total spending (using vndAmount)
    const total = recentTransactions.reduce((sum, t) => {
        // Ensure vndAmount is a number before adding
        return sum + (typeof t.vndAmount === 'number' && !isNaN(t.vndAmount) ? t.vndAmount : 0);
    }, 0);

    // Calculate spending grouped by category name
    const categorySpending = recentTransactions.reduce((acc, t) => {
      // Find category name, default to 'Uncategorized'
      const categoryName = categories.find((c) => c.id === t.categoryId)?.name || 'Uncategorized';
      const amount = typeof t.vndAmount === 'number' && !isNaN(t.vndAmount) ? t.vndAmount : 0;
      acc[categoryName] = (acc[categoryName] || 0) + amount;
      return acc;
    }, {} as Record<string, number>); // Type assertion for the accumulator

    // Convert the category spending object into an array format
    const categoryData = Object.entries(categorySpending)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount); // Optional: Sort categories by amount descending

    return { spendingByCategory: categoryData, totalSpending: total };
  }, [transactions, categories]); // Dependencies: recalculate only if these change


  // --- Handle Loading State ---
  if (isLoadingTransactions || isLoadingCategories) {
    return (
      <div className={`grid gap-4 md:grid-cols-2 ${className}`}>
        {/* Placeholder for Pie Chart Card */}
        <Card>
          <CardHeader><CardTitle>Total Spending by Category</CardTitle></CardHeader>
          <CardContent className="flex h-[300px] items-center justify-center text-muted-foreground">
            <p>Loading Analytics...</p>
            {/* Or use a spinner: <LoadingSpinner /> */}
          </CardContent>
        </Card>
        {/* Placeholder for Summary Card */}
        <Card>
          <CardHeader><CardTitle>Spending Summary</CardTitle></CardHeader>
          <CardContent className="flex h-[200px] items-center justify-center text-muted-foreground">
             <p>Loading Summary...</p>
             {/* Or use a spinner */}
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Handle Error State ---
  if (isErrorTransactions || isErrorCategories) {
     return (
      <div className={`grid gap-4 md:grid-cols-2 ${className}`}>
        {/* Error state for Pie Chart Card */}
        <Card>
          <CardHeader><CardTitle>Error</CardTitle></CardHeader>
          <CardContent className="flex h-[300px] items-center justify-center">
             <p className="text-red-600">Could not load analytics data.</p>
             {/* Optionally show error details from transactionsError or categoriesError */}
          </CardContent>
        </Card>
        {/* Error state for Summary Card */}
        <Card>
          <CardHeader><CardTitle>Error</CardTitle></CardHeader>
          <CardContent className="flex h-[200px] items-center justify-center">
             <p className="text-red-600">Could not load summary data.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Render Content (Data loaded successfully) ---
  // Prepare data for the Pie chart
  const pieChartData: PieChartData[] = spendingByCategory.map((item) => ({
        id: item.category,
        label: item.category, // Label shown on hover/tooltip
        value: item.amount,
        formattedValue: formatCurrency(item.amount, "VND") // Used in arcLinkLabel
      }));

  return (
    <div className={`grid gap-4 md:grid-cols-2 ${className}`}>
      {/* Pie Chart Card */}
      <Card>
        <CardHeader>
          <CardTitle>Total Spending by Category (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
           {/* Conditionally render chart or 'no data' message */}
           {pieChartData.length > 0 ? (
             <div className="h-[300px]">
               <ResponsivePie
                 data={pieChartData} // Use prepared data
                 margin={{ top: 20, right: 20, bottom: 40, left: 20 }} // Adjusted margins slightly
                 innerRadius={0.6}
                 padAngle={0.7} // Slightly increased padAngle
                 cornerRadius={3}
                 activeOuterRadiusOffset={8}
                 // Define consistent colors or use a scheme
                 colors={{ scheme: 'pastel1' }} // Example Nivo color scheme
                 // Or use your custom colors: colors={['#E8B4BC', '#D282A6', ...more colors if needed]}
                 borderWidth={1}
                 borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                 // Arc Link Labels (Lines pointing to slices)
                 arcLinkLabelsSkipAngle={10}
                 arcLinkLabelsTextColor="#333333" // Darker text for better contrast
                 arcLinkLabelsThickness={2}
                 arcLinkLabelsColor={{ from: 'color' }}
                 arcLinkLabel={datum => `${datum.id}: ${datum.formattedValue}`} // Show name and formatted value
                 // Arc Labels (Text inside slices - disabled as they often overlap)
                 enableArcLabels={false}
                 arcLabelsSkipAngle={10}
                 arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                 // Tooltip configuration
                 tooltip={({ datum }) => ( // Custom tooltip for better formatting
                    <div style={{ background: 'white', padding: '9px 12px', border: '1px solid #ccc', fontSize: '14px' }}>
                        <strong>{datum.id}</strong>: {datum.formattedValue}<br />
                        ({((datum.value / totalSpending) * 100).toFixed(1)}%) {/* Show percentage */}
                    </div>
                 )}
                 // Legends (Keys below chart - can be useful if many categories)
                 legends={[
                    // { /* Optional Legend Configuration */ }
                 ]}
               />
             </div>
           ) : (
             // Message when there's no spending data for the period
             <div className="h-[300px] flex items-center justify-center text-muted-foreground">
               No spending data found for the last 30 days.
             </div>
           )}
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Summary (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Total Spending Display */}
            <div>
              <div className="text-sm text-muted-foreground">Total Spending</div>
              <div className="text-2xl font-bold">{formatCurrency(totalSpending, "VND")}</div>
            </div>
            {/* Category Breakdown List */}
            <div className="space-y-2">
               <h4 className="text-sm font-medium text-muted-foreground pt-2">By Category:</h4>
               {spendingByCategory.length > 0 ? (
                 spendingByCategory.map((item, index) => (
                   <div key={item.category} className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        {/* Use chart colors for consistency if possible, requires mapping */}
                       <div className={`w-3 h-3 rounded-full ${ index % 2 === 0 ? 'bg-[#E8B4BC]' : 'bg-[#D282A6]'}`} /> {/* Simple color cycling */}
                       <span className="text-sm font-medium truncate max-w-[150px]">{item.category}</span> {/* Prevent long names breaking layout */}
                     </div>
                     <span className="text-sm text-muted-foreground">
                       {formatCurrency(item.amount, "VND")}
                     </span>
                   </div>
                 ))
               ) : (
                 // Message when no categories have spending
                 <p className="text-sm text-muted-foreground">No spending data by category.</p>
               )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}