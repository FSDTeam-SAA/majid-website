import React from "react";
import { Check, X } from "lucide-react"; // Using lucide-react for icons

const ComparisonTable = () => {
  const features = [
    { name: "Risk Analysis", free: false, payAsYouGo: true, diamond: true },
    { name: "Market Value", free: true, payAsYouGo: true, diamond: true },
    { name: "Full Report", free: false, payAsYouGo: true, diamond: true },
    { name: "Invoicing", free: false, payAsYouGo: true, diamond: true },
    { name: "API Access", free: false, payAsYouGo: false, diamond: true },
    { name: "Discount", free: false, payAsYouGo: false, diamond: "10%" },
    { name: "Certificate", free: false, payAsYouGo: true, diamond: true },
    { name: "Auto iMEI Number", free: true, payAsYouGo: true, diamond: true },
    {
      name: "Auto & Powerful Inventory System",
      free: false,
      payAsYouGo: false,
      diamond: true,
    },
    { name: "Sales Management", free: false, payAsYouGo: false, diamond: true },
  ];

  const StatusIcon = ({ status }: { status: boolean | string }) => {
    if (typeof status === "string")
      return <span className="font-bold text-slate-800">{status}</span>;
    return status ? (
      <Check className="w-5 h-5 text-green-500 mx-auto" />
    ) : (
      <X className="w-5 h-5 text-slate-400 mx-auto" />
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 bg-white dark:bg-card rounded-2xl">
      {/* Header Text */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Compare Plan Features
        </h2>
        <p className="text-slate-500">
          Detailed feature breakdown to help you choose the right plan for your
          business.
        </p>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="p-5 text-lg font-semibold text-slate-800 w-1/4">
                Feature
              </th>
              <th className="p-5 text-lg font-semibold text-slate-800 text-center w-1/4">
                Free Plan
              </th>
              <th className="p-5 text-lg font-semibold text-slate-800 text-center w-1/4">
                Pay-as-you-go
              </th>
              <th className="p-5 text-lg font-semibold text-slate-800 text-center w-1/4">
                Diamond Plan
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {features.map((feature, index) => (
              <tr key={index} className="hover:bg-slate-50 transition-colors">
                <td className="p-5 text-slate-600 font-medium">
                  {feature.name}
                </td>
                <td className="p-5 text-center">
                  <StatusIcon status={feature.free} />
                </td>
                <td className="p-5 text-center">
                  <StatusIcon status={feature.payAsYouGo} />
                </td>
                <td className="p-5 text-center">
                  <StatusIcon status={feature.diamond} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;
