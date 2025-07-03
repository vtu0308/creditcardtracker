'use client';

import { Suspense, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AssetAllocationChart,
  AssetsList,
  LiabilitiesList,
  NetWorthChart,
  NetWorthOverview,
  RecurringIncome,
  AssetDialog,
  LiabilityDialog,
  NetWorthSnapshotDialog,
} from '@/components/net-worth';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Asset, Liability, NetWorthSnapshot } from '@/lib/netWorthStorage';

export default function NetWorthPage() {
  const [assetDialog, setAssetDialog] = useState(false);
  const [liabilityDialog, setLiabilityDialog] = useState(false);
  const [isSnapshotDialogOpen, setSnapshotDialogOpen] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<NetWorthSnapshot | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedLiability, setSelectedLiability] = useState<Liability | null>(null);

  const handleAddAsset = () => {
    setSelectedAsset(null);
    setAssetDialog(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setAssetDialog(true);
  };

  const handleAddLiability = () => {
    setSelectedLiability(null);
    setLiabilityDialog(true);
  };

  const handleEditLiability = (liability: Liability) => {
    setSelectedLiability(liability);
    setLiabilityDialog(true);
  };

  const handleAddSnapshot = () => {
    setSelectedSnapshot(null);
    setSnapshotDialogOpen(true);
  };

  const handleEditSnapshot = (snapshot: NetWorthSnapshot) => {
    setSelectedSnapshot(snapshot);
    setSnapshotDialogOpen(true);
  };

  return (
    <>
      <div className="container pb-6 space-y-8">
        <div className="flex flex-col space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">Net Worth</h1>
            <p className="text-sm text-gray-500 mt-1 mb-6">Track your assets, liabilities, and overall financial health</p>
            {/* The NetWorthOverview component below likely includes its own 'Financial Overview' title */}
            <Suspense fallback={<Skeleton className="h-[120px] w-full" />}>
              <NetWorthOverview />
            </Suspense>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Suspense fallback={<Skeleton className="h-[410px]" />}>
                <NetWorthChart onAddData={handleAddSnapshot} onEditData={handleEditSnapshot} />
              </Suspense>
            </div>
            <div>
              <Suspense fallback={<Skeleton className="h-[410px]" />}>
                <AssetAllocationChart />
              </Suspense>
            </div>
          </div>

          <Suspense fallback={<Skeleton className="h-[200px]" />}>
            <RecurringIncome />
          </Suspense>

          <Tabs defaultValue="assets" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList className="bg-[#F7EDEF] p-1 rounded-lg">
                <TabsTrigger value="assets" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-3 py-1.5">Assets</TabsTrigger>
                <TabsTrigger value="liabilities" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-3 py-1.5">Liabilities</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Button onClick={handleAddAsset} size="sm" className="bg-[#CE839C] hover:bg-[#b9758b] text-white rounded-full">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Asset
                </Button>
                <Button onClick={handleAddLiability} size="sm" variant="outline" className="text-gray-700 border-gray-300 rounded-full bg-white hover:bg-gray-50">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Liability
                </Button>
              </div>
            </div>
            <TabsContent value="assets">
              <Suspense fallback={<Skeleton className="h-[400px]" />}>
                <AssetsList onEdit={handleEditAsset} />
              </Suspense>
            </TabsContent>
            <TabsContent value="liabilities">
              <Suspense fallback={<Skeleton className="h-[400px]" />}>
                <LiabilitiesList onEdit={handleEditLiability} />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <AssetDialog
        open={assetDialog}
        onOpenChange={(open) => {
          if (!open) setSelectedAsset(null);
          setAssetDialog(open);
        }}
        asset={selectedAsset}
      />
      <LiabilityDialog
        open={liabilityDialog}
        onOpenChange={(open) => {
          if (!open) setSelectedLiability(null);
          setLiabilityDialog(open);
        }}
        liability={selectedLiability}
      />
      <NetWorthSnapshotDialog
        open={isSnapshotDialogOpen}
        onOpenChange={(open) => {
          if (!open) setSelectedSnapshot(null);
          setSnapshotDialogOpen(open);
        }}
        snapshot={selectedSnapshot}
      />
    </>
  );
}
