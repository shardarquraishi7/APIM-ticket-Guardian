"use client";

import Link from "next/link";

export default function ChartsExamplePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <nav className="mb-8">
        <Link href="/examples" className="text-telus-purple hover:underline">
          ← Back to Examples
        </Link>
      </nav>
      
      <h1 className="text-3xl font-bold text-telus-purple mb-6">Data Visualization Examples</h1>
      <p className="mb-8">
        This page demonstrates how data visualization would be implemented in a real application.
        Note that these are static examples and would typically use a charting library like Chart.js or D3.js.
      </p>
      
      {/* Bar Chart Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-telus-purple mb-4">Bar Chart</h2>
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-bold text-telus-purple">Monthly Revenue</h3>
          </div>
          <div className="card-body">
            <p className="mb-4">A bar chart showing monthly revenue for the current year.</p>
            
            {/* Static Bar Chart Representation */}
            <div className="h-64 w-full">
              <div className="flex h-full items-end">
                <div className="flex flex-col items-center mx-2 w-1/12">
                  <div className="bg-telus-purple h-20 w-full rounded-t"></div>
                  <span className="text-xs mt-1">Jan</span>
                </div>
                <div className="flex flex-col items-center mx-2 w-1/12">
                  <div className="bg-telus-purple h-32 w-full rounded-t"></div>
                  <span className="text-xs mt-1">Feb</span>
                </div>
                <div className="flex flex-col items-center mx-2 w-1/12">
                  <div className="bg-telus-purple h-24 w-full rounded-t"></div>
                  <span className="text-xs mt-1">Mar</span>
                </div>
                <div className="flex flex-col items-center mx-2 w-1/12">
                  <div className="bg-telus-purple h-40 w-full rounded-t"></div>
                  <span className="text-xs mt-1">Apr</span>
                </div>
                <div className="flex flex-col items-center mx-2 w-1/12">
                  <div className="bg-telus-purple h-48 w-full rounded-t"></div>
                  <span className="text-xs mt-1">May</span>
                </div>
                <div className="flex flex-col items-center mx-2 w-1/12">
                  <div className="bg-telus-purple h-56 w-full rounded-t"></div>
                  <span className="text-xs mt-1">Jun</span>
                </div>
                <div className="flex flex-col items-center mx-2 w-1/12">
                  <div className="bg-telus-purple h-52 w-full rounded-t"></div>
                  <span className="text-xs mt-1">Jul</span>
                </div>
                <div className="flex flex-col items-center mx-2 w-1/12">
                  <div className="bg-telus-purple h-44 w-full rounded-t"></div>
                  <span className="text-xs mt-1">Aug</span>
                </div>
                <div className="flex flex-col items-center mx-2 w-1/12">
                  <div className="bg-telus-purple h-36 w-full rounded-t"></div>
                  <span className="text-xs mt-1">Sep</span>
                </div>
                <div className="flex flex-col items-center mx-2 w-1/12">
                  <div className="bg-telus-purple h-28 w-full rounded-t"></div>
                  <span className="text-xs mt-1">Oct</span>
                </div>
                <div className="flex flex-col items-center mx-2 w-1/12">
                  <div className="bg-telus-purple h-36 w-full rounded-t"></div>
                  <span className="text-xs mt-1">Nov</span>
                </div>
                <div className="flex flex-col items-center mx-2 w-1/12">
                  <div className="bg-telus-purple h-48 w-full rounded-t"></div>
                  <span className="text-xs mt-1">Dec</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-telus-grey">
              <p>In a real implementation, this would be an interactive chart using Chart.js or D3.js.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pie Chart Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-telus-purple mb-4">Pie Chart</h2>
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-bold text-telus-purple">Revenue by Product</h3>
          </div>
          <div className="card-body">
            <p className="mb-4">A pie chart showing revenue distribution by product category.</p>
            
            {/* Static Pie Chart Representation */}
            <div className="flex justify-center">
              <div className="relative h-64 w-64">
                <div className="absolute inset-0 rounded-full border-8 border-telus-purple"></div>
                <div className="absolute inset-0 rounded-full border-t-8 border-r-8 border-telus-green" style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%, 50% 50%)' }}></div>
                <div className="absolute inset-0 rounded-full border-b-8 border-l-8 border-telus-info" style={{ clipPath: 'polygon(0 50%, 0 100%, 50% 100%, 50% 50%)' }}></div>
                <div className="absolute inset-0 rounded-full border-l-8 border-t-8 border-telus-warning" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 50%, 0 50%)' }}></div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center gap-6">
              <div className="flex items-center">
                <div className="h-4 w-4 bg-telus-purple mr-2"></div>
                <span>Product A (40%)</span>
              </div>
              <div className="flex items-center">
                <div className="h-4 w-4 bg-telus-green mr-2"></div>
                <span>Product B (25%)</span>
              </div>
              <div className="flex items-center">
                <div className="h-4 w-4 bg-telus-info mr-2"></div>
                <span>Product C (20%)</span>
              </div>
              <div className="flex items-center">
                <div className="h-4 w-4 bg-telus-warning mr-2"></div>
                <span>Product D (15%)</span>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-telus-grey">
              <p>In a real implementation, this would be an interactive chart using Chart.js or D3.js.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Line Chart Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-telus-purple mb-4">Line Chart</h2>
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-bold text-telus-purple">User Growth</h3>
          </div>
          <div className="card-body">
            <p className="mb-4">A line chart showing user growth over time.</p>
            
            {/* Static Line Chart Representation */}
            <div className="h-64 w-full border-b border-l border-gray-300 relative">
              <div className="absolute bottom-0 left-0 h-full w-full">
                <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polyline
                    points="0,90 10,85 20,80 30,70 40,65 50,55 60,45 70,40 80,30 90,25 100,20"
                    fill="none"
                    stroke="#4B286D"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              
              <div className="absolute bottom-0 w-full flex justify-between px-2">
                <span className="text-xs">Jan</span>
                <span className="text-xs">Feb</span>
                <span className="text-xs">Mar</span>
                <span className="text-xs">Apr</span>
                <span className="text-xs">May</span>
                <span className="text-xs">Jun</span>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-telus-grey">
              <p>In a real implementation, this would be an interactive chart using Chart.js or D3.js.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Implementation Guide */}
      <div className="bg-telus-light-grey p-6 rounded-lg">
        <h3 className="text-lg font-bold text-telus-purple mb-3">Implementation Guide</h3>
        <p className="mb-4">
          To implement interactive charts in your application, you would typically:
        </p>
        <ol className="list-decimal pl-6 mb-4">
          <li className="mb-2">Install a charting library like Chart.js or D3.js</li>
          <li className="mb-2">Fetch data from your API or database</li>
          <li className="mb-2">Process the data into the format required by the charting library</li>
          <li className="mb-2">Render the chart with appropriate options and styling</li>
          <li className="mb-2">Add interactivity like tooltips, zooming, and filtering</li>
        </ol>
        <p>
          These examples are static representations. In a real application, you would use actual data 
          and a proper charting library to create interactive visualizations.
        </p>
      </div>
    </div>
  );
}