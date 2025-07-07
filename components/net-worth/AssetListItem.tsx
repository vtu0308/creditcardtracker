import { Asset } from '@/lib/netWorthStorage';
import { format, parseISO } from 'date-fns';
import { formatCurrency, SupportedCurrency } from '@/lib/utils';
import { Landmark, Calendar, Edit, Trash2, TrendingUp, Clock, BadgePercent, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AssetListItemProps {
  asset: Asset;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
}

const getAssetIcon = (type: string) => {
  // TODO: Expand this later with more specific icons based on asset.type
  // For now, using Landmark as a placeholder, styled according to the theme.
  return <Landmark className="h-6 w-6 text-[#CE839C]" />;
};

const formatAssetType = (type: string): string => {
  if (type.toLowerCase() === 'etf') return 'ETF';
  if (type.toLowerCase() === 'credit_card') return 'Credit Card'; // Though less likely for an asset
  // Basic snake_case to Title Case, can be expanded
  return type.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

export function AssetListItem({ asset, onEdit, onDelete }: AssetListItemProps) {
  // Format the amount in the original currency
  const formattedAmount = formatCurrency(asset.amount, asset.originalCurrency as SupportedCurrency);
  // Also format the VND amount for display if it's different from the original currency
  const formattedVndAmount = asset.originalCurrency !== 'VND' 
    ? ` (${formatCurrency(asset.vndAmount, 'VND')})` 
    : '';
  const formattedDate = format(parseISO(asset.updatedAt), 'M/d/yyyy');

  // Defensive checks for potentially new fields, assuming they are optional on Asset type
  const broker = (asset as any).broker as string | undefined;
  const ticker = (asset as any).ticker as string | undefined;

  return (
    <div className="bg-[#F7EDEF] rounded-lg shadow-sm p-4 space-y-3 hover:bg-[#F3E2E7] transition-colors">
      {/* Top Section: Icon, Name/Badge, Actions */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#F3E2E7] rounded-full self-start">
            {getAssetIcon(asset.type)}
          </div>
          <div className="flex flex-col">
            <p className="font-bold text-gray-800">{asset.name}</p>
            <Badge className="capitalize text-xs self-start mt-0.5 border-none bg-[#EFD6DD] text-[#CE839C] hover:bg-[#e6c9d3]">
              {formatAssetType(asset.customType || asset.type)}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-800 w-8 h-8" onClick={() => onEdit(asset)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 w-8 h-8" onClick={() => onDelete(asset.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Middle Section: Value */}
      <div className="bg-[#FCF6F7] p-3 rounded-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-green-600" />
          <span className="text-xs font-medium text-gray-700">Current Value</span>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg text-green-600 tracking-tight">{formattedAmount}</p>
          {formattedVndAmount && (
            <p className="text-xs text-gray-600">{formattedVndAmount}</p>
          )}
        </div>
      </div>

      {/* Bottom Section: Details */}
      <div className="space-y-1.5 pl-1">
        {asset.bank && (
          <div className="flex items-center gap-1.5">
            <Landmark size={14} className="text-gray-500" />
            <span className="text-xs font-medium text-gray-700">{asset.bank}</span>
          </div>
        )}
        {broker && (
          <div className="flex items-center gap-1.5">
            <Landmark size={14} className="text-gray-500" />
            <span className="text-xs font-medium text-gray-700">Broker: {broker}</span>
          </div>
        )}
        {ticker && (
          <div className="flex items-center gap-1.5">
            <Tag size={14} className="text-gray-500" />
            <span className="text-xs font-medium text-gray-700">Ticker: {ticker}</span>
          </div>
        )}

        {(asset.interestRate || asset.termMonths) && (
          <div className="flex items-center gap-4"> {/* This div will contain one or two items */}
            {asset.interestRate && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                <BadgePercent size={14} className="text-gray-500" /> {asset.interestRate}% APY
              </span>
            )}
            {asset.termMonths && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                <Clock size={14} className="text-gray-500" /> {asset.termMonths} months term
              </span>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-1.5 pt-0.5">
          <Calendar size={12} className="text-gray-500" />
          <span className="text-[11px] font-medium text-gray-500">Updated {formattedDate}</span>
        </div>
      </div>
    </div>
  );
}