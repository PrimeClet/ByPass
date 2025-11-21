import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Building2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { mockEquipment, getAllZones } from '@/data/mockEquipment';
import type { Equipment, EquipmentType, EquipmentStatus, CriticalityLevel, Zone } from '@/types/equipment';
import api from '../axios'

const Equipment = () => {
  const { toast } = useToast();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [zones, setZones] = useState<Zone[]>([])
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);

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
    <div className="container mx-auto p-6 space-y-6 space-x-6">
      <div className="flex justify-between items-center p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Équipements</h1>
          <p className="text-muted-foreground">Gérez vos équipements industriels</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="w-4 h-4" />
              Nouvel Équipement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEquipment ? 'Modifier l\'équipement' : 'Créer un nouvel équipement'}
              </DialogTitle>
              <DialogDescription>
                {editingEquipment ? 'Modifiez les informations de l\'équipement.' : 'Ajoutez un nouvel équipement au système.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nom de l'équipement"
                    required
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value: EquipmentType) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
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
                  <Label htmlFor="zone">Zone</Label>
                  <Select value={formData.zone} onValueChange={(value) => setFormData({...formData, zone: value})}>
                    <SelectTrigger>
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
                  <Label htmlFor="fabricant">Fabricant</Label>
                  <Input
                    id="fabricant"
                    value={formData.fabricant}
                    onChange={(e) => setFormData({...formData, fabricant: e.target.value})}
                    placeholder="Nom du fabricant"
                    required
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Statut</Label>
                  <Select value={formData.status} onValueChange={(value: EquipmentStatus) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
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
                  <Label htmlFor="criticite">Criticité</Label>
                  <Select value={formData.criticite} onValueChange={(value: CriticalityLevel) => setFormData({...formData, criticite: value})}>
                    <SelectTrigger>
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

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingEquipment ? 'Modifier' : 'Créer'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres */}
      <Card className='p-6'>
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nom ou code de l'équipement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="zone-filter">Zone</Label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="w-48">
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
              <Label htmlFor="status-filter">Statut</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
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
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="items-per-page">Éléments par page:</Label>
            <Select 
              value={itemsPerPage.toString()} 
              onValueChange={(value) => setItemsPerPage(Number(value))}
            >
              <SelectTrigger className="w-24">
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
          <div className="text-sm text-muted-foreground">
            Affichage de {startIndex + 1} à {Math.min(endIndex, filteredEquipment.length)} sur {filteredEquipment.length} équipement{filteredEquipment.length > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Liste des équipements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedEquipment.map((eq) => (
          <Card key={eq.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">{eq.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(eq)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(eq.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{eq.code} - {eq.type}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Zone:</span>
                <Badge variant="outline">{eq.zone}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Statut:</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(eq.status)}`} />
                  <span className="text-sm">{eq.status}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Criticité:</span>
                <span className={`text-sm font-medium ${getCriticalityColor(eq.criticite)}`}>
                  {eq.criticite}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Capteurs:</span>
                <Badge variant="secondary">{eq.sensors.length}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEquipment.length === 0 && (
        <Card className="p-12 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {equipment.length === 0 ? 'Aucun équipement' : 'Aucun résultat'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {equipment.length === 0 
              ? 'Commencez par ajouter votre premier équipement.'
              : 'Aucun équipement ne correspond à vos critères de recherche.'
            }
          </p>
          {equipment.length === 0 && (
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un équipement
            </Button>
          )}
        </Card>
      )}

      {/* Pagination */}
      {filteredEquipment.length > 0 && totalPages > 1 && (
        <div className="flex justify-end items-center mt-6 float-right">
          <Pagination>
            <PaginationContent>
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page);
                    }}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
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