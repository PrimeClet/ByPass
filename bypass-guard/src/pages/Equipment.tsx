import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Building2, Search, Filter, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { mockEquipment, getAllZones } from '@/data/mockEquipment';
import type { Equipment, EquipmentType, EquipmentStatus, CriticalityLevel, Zone } from '@/types/equipment';
import api from '../axios'

const Equipment = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [zones, setZones] = useState<Zone[]>([])
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(isMobile ? 'grid' : 'grid');

  const [formData, setFormData] = useState({ 
    name: '',
    type: '' as EquipmentType,
    zone: '',
    fabricant: '',
    model: '',
    status: '' as EquipmentStatus,
    criticite: '' as CriticalityLevel
  });



  const equipmentTypes: EquipmentType[] = ['conveyor', 'crusher', 'pump', 'fan', 'separator', 'loader', 'truck', 'drill'];
  const equipmentStatuses: EquipmentStatus[] = ['operational', 'maintenance', 'down', 'standby'];
  const criticalityLevels: CriticalityLevel[] = ['low', 'medium', 'high', 'critical'];


  const fetchZones = async () => {
    try {
      const response = await api.get('/zones').then(response => {
        if (response.data.data.length !== 0) {
          const formattedZones = response.data.data.map(
            (zoneName: any, index: number) => ({
              id: `${index + 1}`,
              name: zoneName.name,
              description: `${zoneName.description.toLowerCase()}`,
              equipmentCount: zoneName.equipements.length,
            })
          );

          setZones(formattedZones)
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      }); 
    } catch (error) {
      console.error("Erreur lors du GET zones :", error);
    }
  };


  const fetchEquipment = async () => {
    try {
      const response = await api.get('/equipment').then(response => {
        if (response.data.data.length !== 0) {
          const formattedEquips = response.data.data.map(
            (eqs: any, index: number) => ({
              id: eqs.id,
              name: eqs.name,
              code: eqs.code,
              type: eqs.type,
              zone: eqs.zone.name,
              fabricant: eqs.fabricant,
              status: eqs.status,
              criticite: eqs.criticite,
              sensors: eqs.sensors
            })
          );

          setEquipment(formattedEquips)
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      }); 
    } catch (error) {
      console.error("Erreur lors du GET zones :", error);
    }
  };

  useEffect(() => {
   fetchZones()
   fetchEquipment()
  }, []); // 👈 tableau vide = exécuté UNE seule fois au montage


  const getStatusColor = (status: EquipmentStatus) => {
    switch (status) {
      case 'operational': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'down': return 'bg-red-500';
      case 'standby': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getCriticalityColor = (criticite: CriticalityLevel) => {
    switch (criticite) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = selectedZone === 'all' || eq.zone === selectedZone;
    const matchesStatus = selectedStatus === 'all' || eq.status === selectedStatus;

    console.log(selectedZone)
    
    return matchesSearch && matchesZone && matchesStatus;
  });

  // Calcul de la pagination
  const totalPages = Math.ceil(filteredEquipment.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEquipment = filteredEquipment.slice(startIndex, endIndex);

  // Réinitialiser la page quand les filtres ou le nombre d'éléments par page changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedZone, selectedStatus, itemsPerPage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEquipment) {
      setEquipment(equipment.map(eq => 
        eq.id === editingEquipment.id 
          ? { ...eq, ...formData, updatedAt: new Date() }
          : eq
      ));

      api({
        method: 'put',
        url: `/equipment/${editingEquipment.id}`,
        data: formData
      })
      .then(data => {
        fetchEquipment()
        if (data) {
          toast({
            title: "Équipement modifié",
            description: "L'équipement a été mis à jour avec succès.",
          });
        } else {
          toast({
            title: 'Échec de la déconnexion',
            variant: 'destructive',
          });
        }
      })
      
    } else {
      const newEquipment: Equipment = {
        id: `eq_${Date.now()}`,
        ...formData,
        installationDate: new Date(),
        sensors: []
      };

      setEquipment([...equipment, newEquipment]);
      
      api({
        method: 'post',
        url: '/equipment',
        data: formData
      })
      .then(data => {
        fetchEquipment()
        if (data) {
          toast({
            title: "Équipement créé",
            description: "Le nouvel équipement a été ajouté avec succès.",
          });
        } else {
          toast({
            title: 'Échec de la déconnexion',
            variant: 'destructive',
          });
        }
      })
    }
    
    setIsDialogOpen(false);
    setEditingEquipment(null);
    setFormData({
      name: '', type: '' as EquipmentType, zone: '',
      fabricant: '', model: '', status: '' as EquipmentStatus,
      criticite: '' as CriticalityLevel
    });
  };

  const handleEdit = (eq: Equipment) => {
    setEditingEquipment(eq);
    setFormData({
      name: eq.name,
      type: eq.type,
      zone: eq.zone,
      fabricant: eq.fabricant,
      model: eq.model,
      status: eq.status,
      criticite: eq.criticite
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (equipmentId: string) => {
    setEquipment(equipment.filter(eq => eq.id !== equipmentId));
    toast({
      title: "Équipement supprimé",
      description: "L'équipement a été supprimé avec succès.",
    });
  };

  const openCreateDialog = () => {
    setEditingEquipment(null);
    setFormData({
      name: '', type: '' as EquipmentType, zone: '',
      fabricant: '', model: '', status: '' as EquipmentStatus,
      criticite: '' as CriticalityLevel
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="flex-1 space-y-3 sm:space-y-4 md:space-y-6 p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Gestion des Équipements</h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
            Gérez vos équipements industriels
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-2 w-full sm:w-auto" size={isMobile ? "sm" : "default"}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouvel Équipement</span>
              <span className="sm:hidden">Nouvel</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">
                {editingEquipment ? 'Modifier l\'équipement' : 'Créer un nouvel équipement'}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {editingEquipment ? 'Modifiez les informations de l\'équipement.' : 'Ajoutez un nouvel équipement au système.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] sm:max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm">Nom</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nom de l'équipement"
                    required
                    className="text-sm sm:text-base"
                  />
                </div>
                {/* <div>
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    placeholder="Code unique"
                    required
                  />
                </div> */}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type" className="text-sm">Type</Label>
                  <Select value={formData.type} onValueChange={(value: EquipmentType) => setFormData({...formData, type: value})}>
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipmentTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="zone" className="text-sm">Zone</Label>
                  <Select value={formData.zone} onValueChange={(value) => setFormData({...formData, zone: value})}>
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Sélectionner une zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map(zone => (
                        <SelectItem key={zone.id} value={zone.name}>{zone.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* <div>
                <Label htmlFor="location">Localisation</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Localisation précise"
                  required
                />
              </div> */}

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="fabricant" className="text-sm">Fabricant</Label>
                  <Input
                    id="fabricant"
                    value={formData.fabricant}
                    onChange={(e) => setFormData({...formData, fabricant: e.target.value})}
                    placeholder="Nom du fabricant"
                    required
                    className="text-sm sm:text-base"
                  />
                </div>
                {/* <div>
                  <Label htmlFor="model">Modèle</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    placeholder="Modèle"
                    required
                  />
                </div> */}
              </div>

              {/* <div>
                <Label htmlFor="serialNumber">Numéro de série</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                  placeholder="Numéro de série"
                  required
                />
              </div> */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status" className="text-sm">Statut</Label>
                  <Select value={formData.status} onValueChange={(value: EquipmentStatus) => setFormData({...formData, status: value})}>
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipmentStatuses.map(status => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="criticite" className="text-sm">Criticité</Label>
                  <Select value={formData.criticite} onValueChange={(value: CriticalityLevel) => setFormData({...formData, criticite: value})}>
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Sélectionner la criticité" />
                    </SelectTrigger>
                    <SelectContent>
                      {criticalityLevels.map(level => (
                        <SelectItem key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto" size={isMobile ? "sm" : "default"}>
                  Annuler
                </Button>
                <Button type="submit" className="w-full sm:w-auto" size={isMobile ? "sm" : "default"}>
                  {editingEquipment ? 'Modifier' : 'Créer'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <Label htmlFor="search" className="text-xs sm:text-sm">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  id="search"
                  placeholder="Nom ou code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm sm:text-base"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="zone-filter" className="text-xs sm:text-sm">Zone</Label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="w-full text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les zones</SelectItem>
                  {zones.map(zone => (
                    <SelectItem key={zone.id} value={zone.name}>{zone.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter" className="text-xs sm:text-sm">Statut</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {equipmentStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contrôles de pagination et sélection du nombre d'éléments */}
      {filteredEquipment.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Label htmlFor="items-per-page" className="text-xs sm:text-sm whitespace-nowrap">Éléments par page:</Label>
              <Select 
                value={itemsPerPage.toString()} 
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger className="w-16 sm:w-20 md:w-24 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="9">9</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!isMobile && (
              <div className="flex items-center gap-2 border rounded-md p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="h-8"
                >
                  <TableIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground text-left sm:text-right w-full sm:w-auto">
            Affichage de {startIndex + 1} à {Math.min(endIndex, filteredEquipment.length)} sur {filteredEquipment.length} équipement{filteredEquipment.length > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Liste des équipements */}
      {viewMode === 'grid' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {paginatedEquipment.map((eq) => (
              <Card key={eq.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                      <CardTitle className="text-base sm:text-lg truncate">{eq.name}</CardTitle>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(eq)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(eq.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-xs sm:text-sm mt-2 break-words">{eq.code} - {eq.type}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6 pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Zone:</span>
                    <Badge variant="outline" className="text-xs sm:text-sm truncate max-w-[60%]">{eq.zone}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Statut:</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(eq.status)}`} />
                      <span className="text-xs sm:text-sm">{eq.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Criticité:</span>
                    <span className={`text-xs sm:text-sm font-medium ${getCriticalityColor(eq.criticite)}`}>
                      {eq.criticite}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Capteurs:</span>
                    <Badge variant="secondary" className="text-xs sm:text-sm">{eq.sensors.length}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEquipment.length === 0 && (
            <Card className="p-6 sm:p-12 text-center">
              <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">
                {equipment.length === 0 ? 'Aucun équipement' : 'Aucun résultat'}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                {equipment.length === 0 
                  ? 'Commencez par ajouter votre premier équipement.'
                  : 'Aucun équipement ne correspond à vos critères de recherche.'
                }
              </p>
              {equipment.length === 0 && (
                <Button onClick={openCreateDialog} size={isMobile ? "sm" : "default"} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Ajouter un équipement</span>
                  <span className="sm:hidden">Ajouter</span>
                </Button>
              )}
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg md:text-xl">Équipements ({filteredEquipment.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px] text-xs sm:text-sm">Nom</TableHead>
                      <TableHead className="min-w-[100px] text-xs sm:text-sm hidden md:table-cell">Code</TableHead>
                      <TableHead className="min-w-[100px] text-xs sm:text-sm hidden lg:table-cell">Type</TableHead>
                      <TableHead className="min-w-[100px] text-xs sm:text-sm">Zone</TableHead>
                      <TableHead className="min-w-[100px] text-xs sm:text-sm hidden lg:table-cell">Fabricant</TableHead>
                      <TableHead className="min-w-[100px] text-xs sm:text-sm">Statut</TableHead>
                      <TableHead className="min-w-[80px] text-xs sm:text-sm hidden md:table-cell">Criticité</TableHead>
                      <TableHead className="min-w-[80px] text-xs sm:text-sm hidden md:table-cell">Capteurs</TableHead>
                      <TableHead className="min-w-[100px] text-xs sm:text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEquipment.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-base sm:text-lg font-semibold mb-2">
                            {equipment.length === 0 ? 'Aucun équipement' : 'Aucun résultat'}
                          </h3>
                          <p className="text-sm sm:text-base text-muted-foreground mb-4">
                            {equipment.length === 0 
                              ? 'Commencez par ajouter votre premier équipement.'
                              : 'Aucun équipement ne correspond à vos critères de recherche.'
                            }
                          </p>
                          {equipment.length === 0 && (
                            <Button onClick={openCreateDialog} size={isMobile ? "sm" : "default"} className="w-full sm:w-auto">
                              <Plus className="w-4 h-4 sm:mr-2" />
                              <span className="hidden sm:inline">Ajouter un équipement</span>
                              <span className="sm:hidden">Ajouter</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedEquipment.map((eq) => (
                        <TableRow key={eq.id}>
                          <TableCell className="font-medium text-xs sm:text-sm">
                            <div className="space-y-1">
                              <div>{eq.name}</div>
                              <div className="text-xs text-muted-foreground md:hidden">{eq.code}</div>
                              <div className="text-xs text-muted-foreground lg:hidden">
                                <Badge variant="outline" className="text-xs">{eq.type}</Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm hidden md:table-cell">{eq.code}</TableCell>
                          <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
                            <Badge variant="outline" className="text-xs sm:text-sm">{eq.type}</Badge>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            <Badge variant="outline" className="text-xs sm:text-sm truncate max-w-[100px]">{eq.zone}</Badge>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm hidden lg:table-cell">{eq.fabricant || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(eq.status)}`} />
                              <span className="text-xs sm:text-sm">{eq.status}</span>
                            </div>
                            <div className="lg:hidden mt-1 space-y-1">
                              <div className="text-muted-foreground text-xs">Fabricant:</div>
                              <div className="text-xs">{eq.fabricant || 'N/A'}</div>
                              <div className="text-muted-foreground text-xs">Criticité:</div>
                              <span className={`text-xs font-medium ${getCriticalityColor(eq.criticite)}`}>
                                {eq.criticite}
                              </span>
                              <div className="text-muted-foreground text-xs">Capteurs:</div>
                              <Badge variant="secondary" className="text-xs">{eq.sensors.length}</Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                            <span className={`font-medium ${getCriticalityColor(eq.criticite)}`}>
                              {eq.criticite}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                            <Badge variant="secondary" className="text-xs sm:text-sm">{eq.sensors.length}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 sm:gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(eq)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(eq.id)}
                                className="text-destructive hover:text-destructive h-8 w-8 p-0"
                              >
                                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {filteredEquipment.length > 0 && totalPages > 1 && (
        <div className="flex justify-center sm:justify-end items-center mt-4 sm:mt-6 w-full">
          <Pagination>
            <PaginationContent className="flex-wrap gap-1 sm:gap-2">
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                    }
                  }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Sur mobile, afficher seulement la page actuelle et les pages adjacentes
                  if (isMobile) {
                    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                  }
                  return true;
                })
                .map((page, index, array) => {
                  // Ajouter des ellipses sur mobile si nécessaire
                  if (isMobile && index > 0 && page - array[index - 1] > 1) {
                    return (
                      <React.Fragment key={`ellipsis-${page}`}>
                        <PaginationItem>
                          <span className="px-2 text-muted-foreground">...</span>
                        </PaginationItem>
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                            isActive={currentPage === page}
                            className="cursor-pointer text-xs sm:text-sm"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      </React.Fragment>
                    );
                  }
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                        isActive={currentPage === page}
                        className="cursor-pointer text-xs sm:text-sm min-w-[2rem] sm:min-w-[2.5rem]"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default Equipment;