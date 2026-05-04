import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Check,
  Edit,
  Droplets,
  RefreshCw,
  Share2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  useHarvest,
  useUpdateHarvest,
  useSetHarvestWeight,
  useFinalizeHarvest,
  useReopenHarvest,
  useDeleteHarvest,
} from '@/api/hooks/useHarvests';
import { toast } from 'sonner';
import { useState } from 'react';
import { HarvestStatus } from 'shared-schemas';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUnitFormat } from '@/hooks/use-unit-format';
import { isCloudMode } from '@/utils/feature-flags';
import { ShareResourceType, ShareLinkResponse } from 'shared-schemas';
import { useCreateShareLink } from '@/api/hooks/useShares';
import { SharePromptDialog } from '@/components/share/share-prompt-dialog';
import { isSharePromptDismissed } from '@/components/share/share-prompt-utils';
import { ShareDialog } from '@/components/share/share-dialog';
import { getStatusColor } from '@/utils/status-colors';

export const HarvestDetailPage = () => {
  const { t } = useTranslation('harvest');
  const { harvestId } = useParams<{ harvestId: string }>();
  const navigate = useNavigate();
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [weight, setWeight] = useState<string>('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [isEditingHives, setIsEditingHives] = useState(false);
  const [editedHives, setEditedHives] = useState<
    { hiveId: string; framesTaken: number }[]
  >([]);

  const [showSharePrompt, setShowSharePrompt] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareLink, setShareLink] = useState<ShareLinkResponse | null>(null);
  const createShareLink = useCreateShareLink();

  const { data: harvest, isLoading } = useHarvest(harvestId!);
  const updateHarvest = useUpdateHarvest();
  const setHarvestWeight = useSetHarvestWeight();
  const finalizeHarvest = useFinalizeHarvest();
  const reopenHarvest = useReopenHarvest();
  const deleteHarvest = useDeleteHarvest();
  const { getWeightUnit, parseWeight } = useUnitFormat();

  if (isLoading) {
    return <div className="p-6">{t('messages.loadingDetails')}</div>;
  }

  if (!harvest) {
    return <div className="p-6">{t('messages.notFound')}</div>;
  }

  const totalFrames = harvest.harvestHives.reduce(
    (sum, hh) => sum + hh.framesTaken,
    0,
  );

  const handleSetWeight = async () => {
    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) {
      toast.error(t('weight.error'));
      return;
    }

    try {
      await setHarvestWeight.mutateAsync({
        harvestId: harvest.id,
        data: {
          totalWeight: parseWeight(weightValue),
          totalWeightUnit: getWeightUnit(),
        },
      });
      toast.success(t('messages.weightSetSuccess'));
      setIsEditingWeight(false);
      setWeight('');
    } catch {
      toast.error(t('messages.weightSetError'));
    }
  };

  const handleUpdateNotes = async () => {
    try {
      await updateHarvest.mutateAsync({
        harvestId: harvest.id,
        data: { notes },
      });
      toast.success(t('messages.notesUpdateSuccess'));
      setIsEditingNotes(false);
    } catch {
      toast.error(t('messages.notesUpdateError'));
    }
  };

  const handleFinalize = async () => {
    try {
      await finalizeHarvest.mutateAsync(harvest.id);
      toast.success(t('messages.finalizationSuccess'));
      if (isCloudMode() && !isSharePromptDismissed()) {
        setShowSharePrompt(true);
      }
    } catch {
      toast.error(t('messages.finalizationError'));
    }
  };

  const handleShareClick = async () => {
    try {
      const result = await createShareLink.mutateAsync({
        resourceType: ShareResourceType.HARVEST,
        resourceId: harvest.id,
      });
      setShareLink(result);
      setShowShareDialog(true);
    } catch {
      toast.error(t('messages.shareError'));
    }
  };

  const handleReopen = async () => {
    try {
      await reopenHarvest.mutateAsync(harvest.id);
      toast.success(t('messages.reopenSuccess'));
    } catch {
      toast.error(t('messages.reopenError'));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteHarvest.mutateAsync(harvest.id);
      toast.success(t('messages.deleteSuccess'));
      navigate('/harvests');
    } catch {
      toast.error(t('messages.deleteError'));
    }
  };

  const handleUpdateHives = async () => {
    try {
      await updateHarvest.mutateAsync({
        harvestId: harvest.id,
        data: {
          harvestHives: editedHives,
          // Include totalWeight to trigger recalculation if weight is set
          ...(harvest.totalWeight && { totalWeight: harvest.totalWeight }),
        },
      });
      toast.success(t('messages.hivesUpdateSuccess'));
      setIsEditingHives(false);
    } catch {
      toast.error(t('messages.hivesUpdateError'));
    }
  };

  return (
    <div className="p-6 space-y-6">
       {/* Header */}
       <div className="flex items-center justify-between">
         <div className="flex items-center space-x-4">
           <Button
             variant="ghost"
             size="icon"
             onClick={() => navigate('/harvests')}
           >
             <ArrowLeft className="h-4 w-4" />
           </Button>
           <h1 className="text-2xl font-bold">{t('details.title')}</h1>
           <Badge className={cn(getStatusColor(harvest.status), 'text-white')}>
             {harvest.status}
           </Badge>
         </div>
         <div className="flex items-center space-x-2">
           {isCloudMode() && (
             <Button
               variant="outline"
               onClick={handleShareClick}
               disabled={createShareLink.isPending}
             >
               <Share2 className="mr-2 h-4 w-4" />
               {t('actions.share')}
             </Button>
           )}
           {harvest.status === HarvestStatus.COMPLETED && (
             <Button variant="outline" onClick={handleReopen}>
               <RefreshCw className="mr-2 h-4 w-4" />
               {t('actions.reopen')}
             </Button>
           )}
           {harvest.status === HarvestStatus.IN_PROGRESS &&
             harvest.totalWeight && (
               <Button
                 onClick={handleFinalize}
                 data-umami-event="Harvest Finalize"
               >
                 <Check className="mr-2 h-4 w-4" />
                 {t('actions.finalize')}
               </Button>
             )}
           <Dialog>
             <DialogTrigger asChild>
               <Button variant="destructive" size="icon">
                 <Trash2 className="h-4 w-4" />
               </Button>
             </DialogTrigger>
             <DialogContent>
               <DialogHeader>
                 <DialogTitle>{t('actions.deleteConfirmTitle')}</DialogTitle>
                 <DialogDescription>
                   {t('actions.deleteConfirmDescription')}
                 </DialogDescription>
               </DialogHeader>
               {harvest.status === HarvestStatus.COMPLETED && (
                 <Alert className="border-amber-200 bg-amber-50">
                   <AlertTriangle className="h-4 w-4 text-amber-600" />
                   <AlertDescription className="text-amber-800">
                     {t('status.completedDescription')}
                   </AlertDescription>
                 </Alert>
               )}
               <DialogFooter>
                 <DialogClose asChild>
                   <Button variant="outline">{t('common:actions.cancel')}</Button>
                 </DialogClose>
                 <Button variant="destructive" onClick={handleDelete}>
                   {t('common:actions.delete')}
                 </Button>
               </DialogFooter>
             </DialogContent>
           </Dialog>
         </div>
       </div>

       {/* Main Info Card */}
       <Card>
         <CardHeader>
           <CardTitle>{t('details.information')}</CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="grid grid-cols-2 gap-4">
             <div>
               <Label className="text-muted-foreground">{t('details.fields.date')}</Label>
               <p className="font-medium">
                 {format(new Date(harvest.date), 'PPP')}
               </p>
             </div>
             <div>
               <Label className="text-muted-foreground">{t('details.fields.totalHives')}</Label>
               <p className="font-medium">{harvest.harvestHives.length}</p>
             </div>
             <div>
               <Label className="text-muted-foreground">{t('details.fields.totalFrames')}</Label>
               <p className="font-medium">{totalFrames}</p>
             </div>
             <div>
               <Label className="text-muted-foreground">{t('details.fields.totalWeight')}</Label>
               {harvest.status !== HarvestStatus.COMPLETED &&
               !isEditingWeight ? (
                 harvest.totalWeight ? (
                   <div className="flex items-center gap-2">
                     <p className="font-medium">
                       {harvest.totalWeight} {harvest.totalWeightUnit || 'kg'}
                     </p>
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => {
                         setWeight(harvest.totalWeight?.toString() || '');
                         setIsEditingWeight(true);
                       }}
                     >
                       <Edit className="h-4 w-4" />
                     </Button>
                   </div>
                 ) : (
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => setIsEditingWeight(true)}
                   >
                     <Droplets className="mr-2 h-4 w-4" />
                     {t('weight.setWeight')}
                   </Button>
                 )
               ) : isEditingWeight ? (
                 <div className="flex space-x-2">
                   <Input
                     type="number"
                     step="0.1"
                     value={weight}
                     onChange={e => setWeight(e.target.value)}
                     placeholder={t('weight.placeholder')}
                     className="w-24"
                   />
                   <span className="flex items-center">{getWeightUnit()}</span>
                   <Button
                     size="sm"
                     onClick={handleSetWeight}
                     data-umami-event="Harvest Weight Set"
                   >
                     {t('common:actions.save')}
                   </Button>
                   <Button
                     size="sm"
                     variant="outline"
                     onClick={() => {
                       setIsEditingWeight(false);
                       setWeight('');
                     }}
                   >
                     {t('common:actions.cancel')}
                   </Button>
                 </div>
               ) : (
                 <p className="font-medium">
                   {harvest.totalWeight
                     ? `${harvest.totalWeight} ${harvest.totalWeightUnit || 'kg'}`
                     : t('weight.notSet')}
                 </p>
               )}
             </div>
           </div>

           {/* Notes */}
           <div>
             <div className="flex items-center justify-between mb-2">
               <Label className="text-muted-foreground">{t('details.fields.notes')}</Label>
               {harvest.status !== HarvestStatus.COMPLETED &&
                 !isEditingNotes && (
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => {
                       setNotes(harvest.notes || '');
                       setIsEditingNotes(true);
                     }}
                   >
                     <Edit className="h-4 w-4" />
                   </Button>
                 )}
             </div>
             {isEditingNotes ? (
               <div className="space-y-2">
                 <Textarea
                   value={notes}
                   onChange={e => setNotes(e.target.value)}
                   rows={3}
                 />
                 <div className="flex space-x-2">
                   <Button size="sm" onClick={handleUpdateNotes}>
                     {t('common:actions.save')}
                   </Button>
                   <Button
                     size="sm"
                     variant="outline"
                     onClick={() => setIsEditingNotes(false)}
                   >
                     {t('common:actions.cancel')}
                   </Button>
                 </div>
               </div>
             ) : (
               <p className="text-sm">{harvest.notes || t('details.fields.noNotes')}</p>
             )}
           </div>
         </CardContent>
       </Card>

       {/* Hives Card */}
       <Card>
         <CardHeader className="flex flex-row items-center justify-between">
           <CardTitle>{t('hiveDistribution.title')}</CardTitle>
           {harvest.status !== HarvestStatus.COMPLETED && !isEditingHives && (
             <Button
               variant="ghost"
               size="sm"
               onClick={() => {
                 setEditedHives(
                   harvest.harvestHives.map(hh => ({
                     hiveId: hh.hiveId,
                     framesTaken: hh.framesTaken,
                   })),
                 );
                 setIsEditingHives(true);
               }}
             >
               <Edit className="h-4 w-4 mr-1" />
               {t('common:actions.edit')}
             </Button>
           )}
         </CardHeader>
         <CardContent>
           {isEditingHives ? (
             <div className="space-y-3">
               {editedHives.map((hh, index) => {
                 const originalHive = harvest.harvestHives.find(
                   h => h.hiveId === hh.hiveId,
                 );
                 return (
                   <div
                     key={hh.hiveId}
                     className="flex items-center justify-between p-3 border rounded-lg"
                   >
                     <div className="flex-1">
                       <p className="font-medium">
                         {originalHive?.hiveName || 'Unknown Hive'}
                       </p>
                     </div>
                     <div className="flex items-center gap-2">
                       <Input
                        type="number"
                        min="1"
                        value={hh.framesTaken}
                        onChange={e => {
                          const newHives = [...editedHives];
                          newHives[index].framesTaken =
                            parseInt(e.target.value) || 1;
                          setEditedHives(newHives);
                        }}
                        className="w-20"
                      />
                       <span className="text-sm text-muted-foreground">
                         {t('hiveDistribution.frames')}
                       </span>
                     </div>
                   </div>
                 );
               })}
               <div className="flex justify-end gap-2 pt-2">
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => setIsEditingHives(false)}
                 >
                   {t('common:actions.cancel')}
                 </Button>
                 <Button
                   size="sm"
                   onClick={handleUpdateHives}
                   disabled={updateHarvest.isPending}
                 >
                   {updateHarvest.isPending ? t('hiveDistribution.savingButton') : t('hiveDistribution.saveButton')}
                 </Button>
               </div>
             </div>
           ) : (
             <div className="space-y-3">
               {harvest.harvestHives.map(hh => (
                 <div
                   key={hh.id}
                   className="flex items-center justify-between p-3 border rounded-lg"
                 >
                   <div className="flex-1">
                     <p className="font-medium">{hh.hiveName}</p>
                     <p className="text-sm text-muted-foreground">
                       {hh.framesTaken} {t('hiveDistribution.frames')}
                     </p>
                   </div>
                   {hh.honeyAmount && (
                     <div className="text-right">
                       <p className="font-medium">
                         {hh.honeyAmount.toFixed(2)} {hh.honeyAmountUnit || 'kg'}
                       </p>
                       <p className="text-sm text-muted-foreground">
                         {hh.honeyPercentage?.toFixed(1)}%
                       </p>
                     </div>
                   )}
                 </div>
               ))}
             </div>
           )}
         </CardContent>
       </Card>

       {/* Status Messages */}
       {harvest.status === HarvestStatus.DRAFT && (
         <Alert className="border-yellow-200 bg-yellow-50">
           <AlertTriangle className="h-5 w-5 text-yellow-600" />
           <AlertTitle className="text-yellow-900">{t('status.draft')}</AlertTitle>
           <AlertDescription className="text-yellow-700">
             {t('status.draftDescription')}
           </AlertDescription>
         </Alert>
       )}

       {harvest.status === HarvestStatus.IN_PROGRESS && harvest.totalWeight && (
         <Alert className="border-blue-200 bg-blue-50">
           <AlertTriangle className="h-5 w-5 text-blue-600" />
           <AlertTitle className="text-blue-900">{t('status.inProgress')}</AlertTitle>
           <AlertDescription className="text-blue-700">
             {t('status.inProgressDescription')}
           </AlertDescription>
         </Alert>
       )}

      <SharePromptDialog
        open={showSharePrompt}
        onOpenChange={setShowSharePrompt}
        resourceType={ShareResourceType.HARVEST}
        resourceId={harvest.id}
        title="Harvest finalized!"
      />

      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        shareLink={shareLink}
      />
    </div>
  );
};

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
