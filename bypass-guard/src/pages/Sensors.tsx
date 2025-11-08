import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Search, Settings } from 'lucide-react';
import { mockEquipment } from '@/data/mockEquipment';
import { Sensor, SensorType, SensorStatus } from '@/types/equipment';
import { toast } from 'sonner';
import type { Equipment, EquipmentType, EquipmentStatus, CriticalityLevel, Zone } from '@/types/equipment';
import api from '../axios'

const Sensors: React.FC = () => {
  const [equipmentData, setEquipmentData] = useState(mockEquipment);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
  const [newSensor, setNewSensor] = useState({
    name: '',
    code: '',
    type: 'temperature' as SensorType,
    unit: '',
    minValue: 0,
    maxValue: 100,
    criticalThreshold: 80,
    equipmentId: '',
    status: 'active' as SensorStatus
  });
  const [sensor, setSensor] = useState<Sensor[]>([]);

  // Flatten all sensors from all equipment
  // const allSensors = equipmentData.flatMap(equipment => 
  //   equipment.sensors.map(sensor => ({
  //     ...sensor,
  //     equipmentName: equipment.name,
  //     equipmentCode: equipment.code
  //   }))
  // );

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

  const fetchSensor = async () => {
    try {
      const response = await api.get('/sensors').then(response => {
        const data = response.data.data
        if (data.length !== 0) {
          const formattedEquips = data.map(
            (eqs: any, index: number) => ({
              id: eqs.id,
              equipmentId: eqs.equipment_id,
              name: eqs.name ,
              code: eqs.code,
              type: eqs.type,
              unit: eqs.unite,
              criticalThreshold: eqs.seuil_critique,
              status: eqs.status,
              lastCalibration: (new Date(eqs.Dernier_Etallonnage.replace(' ', 'T'))).toLocaleString(),
              equipmentName: `${eqs.equipment.name} - ${eqs.equipment.zone.name}` ,
              equipmentCode: eqs.equipment.code,
              isActive: eqs.status === 'active' ? true : false
            })
          );

          console.log(formattedEquips)

          setSensor(formattedEquips)
        }
        // console.log(response);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      }); 
    } catch (error) {
      console.error("Erreur lors du GET zones :", error);
    }
  };

  useEffect(() => {
   fetchEquipment()
   fetchSensor()
  }, []); // 👈 tableau vide = exécuté UNE seule fois au montage

  const filteredSensors = sensor.filter(sensor => {
    const matchesSearch = sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sensor.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sensor.equipmentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || sensor.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || sensor.status === selectedStatus;
    const matchesEquipment = selectedEquipment === 'all' || sensor.equipmentId === selectedEquipment;
    console.log(selectedEquipment)
    return matchesSearch && matchesType && matchesStatus && matchesEquipment;
  });

  const handleAddSensor = () => {
    const sensor: Sensor = {
      id: `sensor-${Date.now()}`,
      ...newSensor,
      status: 'active' as SensorStatus,
      isActive: true,
      bypassHistory: []
    };

    setEquipmentData(equipmentData.map(equipment => 
      equipment.id === newSensor.equipmentId
        ? { ...equipment, sensors: [...equipment.sensors, sensor] }
        : equipment
    ));

    api({
      method: 'post',
      url: `/equipment/${sensor.equipmentId}/sensors`,
      data: newSensor
    })
    .then(data => {
      fetchEquipment()
      fetchSensor()
      if (data) {
        toast.success("Capteur créé");
      } else {
        toast.error("Probleme de connexion");
      }
    })

    setNewSensor({
      name: '',
      code: '',
      type: 'temperature',
      unit: '',
      minValue: 0,
      maxValue: 100,
      criticalThreshold: 80,
      equipmentId: '',
      status: 'active'
    });
    setIsAddDialogOpen(false);
    toast.success('Capteur ajouté avec succès');
  };

  const handleEditSensor = (sensor: Sensor) => {
    setEditingSensor(sensor);
    setNewSensor({
      name: sensor.name,
      code: sensor.code,
      type: sensor.type,
      unit: sensor.unit,
      minValue: sensor.minValue,
      maxValue: sensor.maxValue,
      criticalThreshold: sensor.criticalThreshold,
      equipmentId: sensor.equipmentId,
      status: sensor.status
    });
  };

  const handleUpdateSensor = () => {
    if (editingSensor) {
      setEquipmentData(equipmentData.map(equipment => ({
        ...equipment,
        sensors: equipment.sensors.map(sensor =>
          sensor.id === editingSensor.id
            ? { ...sensor, ...newSensor }
            : sensor
        )
      })));

      api({
        method: 'put',
        url: `/sensors/${editingSensor.id}`,
        data: newSensor
      })
      .then(data => {
        fetchSensor()
        if (data) {
          toast.success('Capteur modifié avec succès');
        } else {
          toast.error('Erreur de Connexion');
        }
      })

      setEditingSensor(null);
      setNewSensor({
        name: '',
        code: '',
        type: 'temperature',
        unit: '',
        minValue: 0,
        maxValue: 100,
        criticalThreshold: 80,
        equipmentId: '',
        status: 'active'
      });
    }
  };

  const handleDeleteSensor = (sensorId: string) => {
    setEquipmentData(equipmentData.map(equipment => ({
      ...equipment,
      sensors: equipment.sensors.filter(sensor => sensor.id !== sensorId)
    })));
    toast.success('Capteur supprimé avec succès');
  };

  const toggleSensorStatus = (sensorId: string) => {
    setEquipmentData(equipmentData.map(equipment => ({
      ...equipment,
      sensors: equipment.sensors.map(sensor =>
        sensor.id === sensorId
          ? { ...sensor, isActive: !sensor.isActive }
          : sensor
      )
    })));
    toast.success('Statut du capteur modifié');
  };

  const getStatusBadgeVariant = (status: SensorStatus) => {
    switch (status) {
      case 'active': return 'default';
      case 'bypassed': return 'secondary';
      case 'maintenance': return 'outline';
      case 'faulty': return 'destructive';
      case 'calibration': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: SensorStatus) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'bypassed': return 'Contourné';
      case 'maintenance': return 'Maintenance';
      case 'faulty': return 'Défaillant';
      case 'calibration': return 'Calibrage';
      default: return status;
    }
  };

  const getTypeLabel = (type: SensorType) => {
    switch (type) {
      case 'temperature': return 'Température';
      case 'vibration': return 'Vibration';
      case 'pressure': return 'Pression';
      case 'flow': return 'Débit';
      case 'level': return 'Niveau';
      case 'speed': return 'Vitesse';
      case 'current': return 'Courant';
      case 'voltage': return 'Tension';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Capteurs</h1>
          <p className="text-muted-foreground">
            Gérez les capteurs et leurs configurations
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un capteur
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Ajouter un capteur</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau capteur à un équipement
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="equipment">Équipement</Label>
                <Select value={newSensor.equipmentId} onValueChange={(value) => setNewSensor({...newSensor, equipmentId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un équipement" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipment.map(equipment => (
                      <SelectItem key={equipment.id} value={equipment.id}>
                        {equipment.name} ({equipment.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    value={newSensor.name}
                    onChange={(e) => setNewSensor({...newSensor, name: e.target.value})}
                  />
                </div>
                {/* <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    value={newSensor.code}
                    onChange={(e) => setNewSensor({...newSensor, code: e.target.value})}
                  />
                </div> */}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={newSensor.type} onValueChange={(value: SensorType) => setNewSensor({...newSensor, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="temperature">Température</SelectItem>
                      <SelectItem value="vibration">Vibration</SelectItem>
                      <SelectItem value="pressure">Pression</SelectItem>
                      <SelectItem value="flow">Débit</SelectItem>
                      <SelectItem value="level">Niveau</SelectItem>
                      <SelectItem value="speed">Vitesse</SelectItem>
                      <SelectItem value="current">Courant</SelectItem>
                      <SelectItem value="voltage">Tension</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unité</Label>
                  <Input
                    id="unit"
                    value={newSensor.unit}
                    onChange={(e) => setNewSensor({...newSensor, unit: e.target.value})}
                    placeholder="°C, bar, m³/h..."
                  />
                </div>
              </div>
              {/* <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minValue">Valeur min</Label>
                  <Input
                    id="minValue"
                    type="number"
                    value={newSensor.minValue}
                    onChange={(e) => setNewSensor({...newSensor, minValue: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxValue">Valeur max</Label>
                  <Input
                    id="maxValue"
                    type="number"
                    value={newSensor.maxValue}
                    onChange={(e) => setNewSensor({...newSensor, maxValue: Number(e.target.value)})}
                  />
                </div>
              </div> */}
              <div className="grid grid-cols-1 gap-4">
                {/* <div className="space-y-2">
                  <Label htmlFor="warningThreshold">Seuil d'alerte</Label>
                  <Input
                    id="warningThreshold"
                    type="number"
                    value={newSensor.warningThreshold}
                    onChange={(e) => setNewSensor({...newSensor, warningThreshold: Number(e.target.value)})}
                  />
                </div> */}
                <div className="space-y-2">
                  <Label htmlFor="criticalThreshold">Seuil critique</Label>
                  <Input
                    id="criticalThreshold"
                    type="number"
                    value={newSensor.criticalThreshold}
                    onChange={(e) => setNewSensor({...newSensor, criticalThreshold: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={newSensor.status} onValueChange={(value: SensorStatus) => setNewSensor({...newSensor, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="bypassed">Contourné</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="faulty">Défaillant</SelectItem>
                      <SelectItem value="calibration">Calibrage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddSensor}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>
            Filtrez la liste des capteurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
              <SelectTrigger>
                <SelectValue placeholder="Équipement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les équipements</SelectItem>
                {equipment.map(equipment => (
                  <SelectItem key={equipment.id} value={equipment.id}>
                    {equipment.name} - {equipment.zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="temperature">Température</SelectItem>
                <SelectItem value="vibration">Vibration</SelectItem>
                <SelectItem value="pressure">Pression</SelectItem>
                <SelectItem value="flow">Débit</SelectItem>
                <SelectItem value="level">Niveau</SelectItem>
                <SelectItem value="speed">Vitesse</SelectItem>
                <SelectItem value="current">Courant</SelectItem>
                <SelectItem value="voltage">Tension</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="bypassed">Contourné</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="faulty">Défaillant</SelectItem>
                <SelectItem value="calibration">Calibrage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Capteurs ({filteredSensors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Équipement</TableHead>
                {/* <TableHead>Plage</TableHead> */}
                <TableHead>Seuils</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>État</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSensors.map((sensor) => (
                <TableRow key={sensor.id}>
                  <TableCell className="font-medium">{sensor.name}</TableCell>
                  <TableCell>{sensor.code}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getTypeLabel(sensor.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>{sensor.equipmentName}</TableCell>
                  {/* <TableCell>
                    {sensor.minValue} - {sensor.maxValue} {sensor.unit}
                  </TableCell> */}
                  <TableCell>
                    <div className="text-sm">
                      {/* <div>⚠️ {sensor.warningThreshold} {sensor.unit}</div> */}
                      <div>🚨 {sensor.criticalThreshold} {sensor.unit}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(sensor.status)}>
                      {getStatusLabel(sensor.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSensorStatus(sensor.id)}
                    >
                      <Badge variant={sensor.isActive ? "default" : "secondary"}>
                        {sensor.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSensor(sensor)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[625px]">
                          <DialogHeader>
                            <DialogTitle>Modifier le capteur</DialogTitle>
                            <DialogDescription>
                              Modifiez les paramètres du capteur
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="equipment">Équipement</Label>
                              <Select value={newSensor.equipmentId} onValueChange={(value) => setNewSensor({...newSensor, equipmentId: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner un équipement" />
                                </SelectTrigger>
                                <SelectContent>
                                  {equipment.map(equipment => (
                                    <SelectItem key={equipment.id} value={equipment.id}>
                                      {equipment.name} ({equipment.code})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="name">Nom</Label>
                                <Input
                                  id="name"
                                  value={newSensor.name}
                                  onChange={(e) => setNewSensor({...newSensor, name: e.target.value})}
                                />
                              </div>
                              {/* <div className="space-y-2">
                                <Label htmlFor="code">Code</Label>
                                <Input
                                  id="code"
                                  value={newSensor.code}
                                  onChange={(e) => setNewSensor({...newSensor, code: e.target.value})}
                                />
                              </div> */}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select value={newSensor.type} onValueChange={(value: SensorType) => setNewSensor({...newSensor, type: value})}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="temperature">Température</SelectItem>
                                    <SelectItem value="vibration">Vibration</SelectItem>
                                    <SelectItem value="pressure">Pression</SelectItem>
                                    <SelectItem value="flow">Débit</SelectItem>
                                    <SelectItem value="level">Niveau</SelectItem>
                                    <SelectItem value="speed">Vitesse</SelectItem>
                                    <SelectItem value="current">Courant</SelectItem>
                                    <SelectItem value="voltage">Tension</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="unit">Unité</Label>
                                <Input
                                  id="unit"
                                  value={newSensor.unit}
                                  onChange={(e) => setNewSensor({...newSensor, unit: e.target.value})}
                                  placeholder="°C, bar, m³/h..."
                                />
                              </div>
                            </div>
                            {/* <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="minValue">Valeur min</Label>
                                <Input
                                  id="minValue"
                                  type="number"
                                  value={newSensor.minValue}
                                  onChange={(e) => setNewSensor({...newSensor, minValue: Number(e.target.value)})}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="maxValue">Valeur max</Label>
                                <Input
                                  id="maxValue"
                                  type="number"
                                  value={newSensor.maxValue}
                                  onChange={(e) => setNewSensor({...newSensor, maxValue: Number(e.target.value)})}
                                />
                              </div>
                            </div> */}
                            <div className="grid grid-cols-1 gap-4">
                              {/* <div className="space-y-2">
                                <Label htmlFor="warningThreshold">Seuil d'alerte</Label>
                                <Input
                                  id="warningThreshold"
                                  type="number"
                                  value={newSensor.warningThreshold}
                                  onChange={(e) => setNewSensor({...newSensor, warningThreshold: Number(e.target.value)})}
                                />
                              </div> */}
                              <div className="space-y-2">
                                <Label htmlFor="criticalThreshold">Seuil critique</Label>
                                <Input
                                  id="criticalThreshold"
                                  type="number"
                                  value={newSensor.criticalThreshold}
                                  onChange={(e) => setNewSensor({...newSensor, criticalThreshold: Number(e.target.value)})}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={newSensor.status} onValueChange={(value: SensorStatus) => setNewSensor({...newSensor, status: value})}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Statut" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Actif</SelectItem>
                                    <SelectItem value="bypassed">Contourné</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                    <SelectItem value="faulty">Défaillant</SelectItem>
                                    <SelectItem value="calibration">Calibrage</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleUpdateSensor}>Sauvegarder</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer le capteur</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer ce capteur ? Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteSensor(sensor.id)}>
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sensors;