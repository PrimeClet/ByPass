import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, Search, LayoutGrid, Table as TableIcon } from 'lucide-react';
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
import { getAllZones, getEquipmentByZone } from '@/data/mockEquipment';
import api from '../axios'
interface Zone {
  id: string;
  name: string;
  description: string;
  equipmentCount: number;
}


const Zones = () => {
  const { toast } = useToast();
  const [zones, setZones] = useState<Zone[]>([]); // 👈 initialise avec un tableau vide
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const fetchZones = async () => {
    try {
      const response = await api.get('/zones').then(response => {
        if (response.data.data.length !== 0) {
          console.log(response.data);

          const formattedZones = response.data.data.map(
            (zoneName: any, index: number) => ({
              id: `zone_${index + 1}`,
              name: zoneName.name,
              description: `${zoneName.description.toLowerCase()}`,
              equipmentCount: zoneName.equipements.length,
            })
          );

          setZones(formattedZones);
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
  }, []); // 👈 tableau vide = exécuté UNE seule fois au montage

  // Filtrage des zones
  const filteredZones = zones.filter(zone => {
    const matchesSearch = zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         zone.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Calcul de la pagination
  const totalPages = Math.ceil(filteredZones.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedZones = filteredZones.slice(startIndex, endIndex);

  // Réinitialiser la page quand les filtres ou le nombre d'éléments par page changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);


  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingZone) {
      setZones(zones.map(zone => 
        zone.id === editingZone.id 
          ? { ...zone, ...formData }
          : zone
      ));

      let id = editingZone.id.split("_")[1] 

      api({
        method: 'put',
        url: `/zones/${id}`,
        data: formData
      })
      .then(data => {
        fetchZones()
        if (data) {
          toast({
            title: "Zone modifiée",
            description: "La zone a été mise à jour avec succès.",
          });
        } else {
          toast({
            title: 'Échec de la mise a jour de l\'equipement',
            variant: 'destructive',
          });
        }
      })
      
    } else {
    
      api({
        method: 'post',
        url: '/zones',
        data: formData
      })
      .then(data => {
        fetchZones()
        if (data) {
          toast({
            title: "Zone créée",
            description: "La nouvelle zone a été ajoutée avec succès.",
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
    setEditingZone(null);
    setFormData({ name: '', description: ''});
  };

  const handleEdit = (zone: Zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      description: zone.description
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (zoneId: string) => {
    setZones(zones.filter(zone => zone.id !== zoneId));
    toast({
      title: "Zone supprimée",
      description: "La zone a été supprimée avec succès.",
    });
  };

  const openCreateDialog = () => {
    setEditingZone(null);
    setFormData({ name: '', description: ''});
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6 space-x-6">
      <div className="flex justify-between items-center p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Zones</h1>
          <p className="text-muted-foreground">Gérez les zones et leurs superviseurs</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="w-4 h-4" />
              Nouvelle Zone
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingZone ? 'Modifier la zone' : 'Créer une nouvelle zone'}
              </DialogTitle>
              <DialogDescription>
                {editingZone ? 'Modifiez les informations de la zone.' : 'Ajoutez une nouvelle zone au système.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name">Nom de la zone</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Zone de production A"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Description de la zone"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingZone ? 'Modifier' : 'Créer'}
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
                  placeholder="Nom ou description de la zone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contrôles de pagination et sélection du nombre d'éléments */}
      {filteredZones.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-4">
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
          </div>
          <div className="text-sm text-muted-foreground">
            Affichage de {startIndex + 1} à {Math.min(endIndex, filteredZones.length)} sur {filteredZones.length} zone{filteredZones.length > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Liste des zones */}
      {viewMode === 'grid' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedZones.map((zone) => (
              <Card key={zone.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">{zone.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(zone)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(zone.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{zone.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Équipements:</span>
                    <Badge variant="secondary">{zone.equipmentCount}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredZones.length === 0 && (
            <Card className="p-12 text-center">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {zones.length === 0 ? 'Aucune zone' : 'Aucun résultat'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {zones.length === 0 
                  ? 'Commencez par créer votre première zone.'
                  : 'Aucune zone ne correspond à vos critères de recherche.'
                }
              </p>
              {zones.length === 0 && (
                <Button onClick={openCreateDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer une zone
                </Button>
              )}
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Zones ({filteredZones.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Équipements</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedZones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        {zones.length === 0 ? 'Aucune zone' : 'Aucun résultat'}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {zones.length === 0 
                          ? 'Commencez par créer votre première zone.'
                          : 'Aucune zone ne correspond à vos critères de recherche.'
                        }
                      </p>
                      {zones.length === 0 && (
                        <Button onClick={openCreateDialog}>
                          <Plus className="w-4 h-4 mr-2" />
                          Créer une zone
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedZones.map((zone) => (
                    <TableRow key={zone.id}>
                      <TableCell className="font-medium">
                        {zone.name}
                      </TableCell>
                      <TableCell>{zone.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{zone.equipmentCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(zone)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(zone.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {filteredZones.length > 0 && totalPages > 1 && (
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

export default Zones;