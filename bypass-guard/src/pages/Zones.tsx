import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingZone ? 'Modifier la zone' : 'Créer une nouvelle zone'}
              </DialogTitle>
              <DialogDescription>
                {editingZone ? 'Modifiez les informations de la zone.' : 'Ajoutez une nouvelle zone au système.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.map((zone) => (
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
              {/* <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Superviseur:</span>
                <span className="text-sm font-medium">{zone.supervisor}</span>
              </div> */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Équipements:</span>
                <Badge variant="secondary">{zone.equipmentCount}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {zones.length === 0 && (
        <Card className="p-12 text-center">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune zone</h3>
          <p className="text-muted-foreground mb-4">
            Commencez par créer votre première zone.
          </p>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Créer une zone
          </Button>
        </Card>
      )}
    </div>
  );
};

export default Zones;