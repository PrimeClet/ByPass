import React, { useState } from 'react';
import { Save, Plus, Edit2, Trash2, UserCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { mockUsers } from '@/data/mockUsers';
import type { User, UserRole } from '@/types/user';

interface FaultResponsibility {
  id: string;
  faultType: string;
  responsibleUsers: string[];
  escalationDelay: number; // in hours
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const Settings = () => {
  const { toast } = useToast();
  const [users] = useState<User[]>(mockUsers);
  
  const [responsibilities, setResponsibilities] = useState<FaultResponsibility[]>([
    {
      id: '1',
      faultType: 'Panne électrique',
      responsibleUsers: ['user_1', 'user_2'],
      escalationDelay: 2,
      priority: 'high'
    },
    {
      id: '2',
      faultType: 'Problème mécanique',
      responsibleUsers: ['user_3'],
      escalationDelay: 4,
      priority: 'medium'
    },
    {
      id: '3',
      faultType: 'Défaillance capteur',
      responsibleUsers: ['user_4'],
      escalationDelay: 1,
      priority: 'critical'
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResponsibility, setEditingResponsibility] = useState<FaultResponsibility | null>(null);
  const [formData, setFormData] = useState({
    faultType: '',
    responsibleUsers: [] as string[],
    escalationDelay: 2,
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical'
  });

  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'Bypass Guard Industries',
    maxBypassDuration: 72, // hours
    notificationEmail: 'admin@bypassguard.com',
    autoApprovalThreshold: 4, // hours
    emergencyContact: '+33 1 23 45 67 89'
  });

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Utilisateur inconnu';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmitResponsibility = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingResponsibility) {
      setResponsibilities(responsibilities.map(resp => 
        resp.id === editingResponsibility.id 
          ? { ...resp, ...formData }
          : resp
      ));
      toast({
        title: "Responsabilité modifiée",
        description: "La responsabilité a été mise à jour avec succès.",
      });
    } else {
      const newResponsibility: FaultResponsibility = {
        id: `resp_${Date.now()}`,
        ...formData
      };
      setResponsibilities([...responsibilities, newResponsibility]);
      toast({
        title: "Responsabilité créée",
        description: "La nouvelle responsabilité a été ajoutée avec succès.",
      });
    }
    
    setIsDialogOpen(false);
    setEditingResponsibility(null);
    setFormData({ faultType: '', responsibleUsers: [], escalationDelay: 2, priority: 'medium' });
  };

  const handleEditResponsibility = (resp: FaultResponsibility) => {
    setEditingResponsibility(resp);
    setFormData({
      faultType: resp.faultType,
      responsibleUsers: resp.responsibleUsers,
      escalationDelay: resp.escalationDelay,
      priority: resp.priority
    });
    setIsDialogOpen(true);
  };

  const handleDeleteResponsibility = (respId: string) => {
    setResponsibilities(responsibilities.filter(resp => resp.id !== respId));
    toast({
      title: "Responsabilité supprimée",
      description: "La responsabilité a été supprimée avec succès.",
    });
  };

  const openCreateDialog = () => {
    setEditingResponsibility(null);
    setFormData({ faultType: '', responsibleUsers: [], escalationDelay: 2, priority: 'medium' });
    setIsDialogOpen(true);
  };

  const handleSaveGeneralSettings = () => {
    toast({
      title: "Paramètres sauvegardés",
      description: "Les paramètres généraux ont été mis à jour avec succès.",
    });
  };

  const toggleUserResponsibility = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      responsibleUsers: prev.responsibleUsers.includes(userId)
        ? prev.responsibleUsers.filter(id => id !== userId)
        : [...prev.responsibleUsers, userId]
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
        <p className="text-muted-foreground">Configurez les paramètres du système</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">Paramètres généraux</TabsTrigger>
          <TabsTrigger value="responsibilities">Gestion des responsabilités</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres généraux</CardTitle>
              <CardDescription>
                Configurez les paramètres de base du système
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="companyName">Nom de l'entreprise</Label>
                  <Input
                    id="companyName"
                    value={generalSettings.companyName}
                    onChange={(e) => setGeneralSettings({...generalSettings, companyName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="maxBypassDuration">Durée max de bypass (heures)</Label>
                  <Input
                    id="maxBypassDuration"
                    type="number"
                    value={generalSettings.maxBypassDuration}
                    onChange={(e) => setGeneralSettings({...generalSettings, maxBypassDuration: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="notificationEmail">Email de notification</Label>
                  <Input
                    id="notificationEmail"
                    type="email"
                    value={generalSettings.notificationEmail}
                    onChange={(e) => setGeneralSettings({...generalSettings, notificationEmail: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="autoApprovalThreshold">Seuil d'approbation auto (heures)</Label>
                  <Input
                    id="autoApprovalThreshold"
                    type="number"
                    value={generalSettings.autoApprovalThreshold}
                    onChange={(e) => setGeneralSettings({...generalSettings, autoApprovalThreshold: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="emergencyContact">Contact d'urgence</Label>
                <Input
                  id="emergencyContact"
                  value={generalSettings.emergencyContact}
                  onChange={(e) => setGeneralSettings({...generalSettings, emergencyContact: e.target.value})}
                />
              </div>

              <Button onClick={handleSaveGeneralSettings} className="gap-2">
                <Save className="w-4 h-4" />
                Sauvegarder les paramètres
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responsibilities">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gestion des responsabilités par type de panne</CardTitle>
                  <CardDescription>
                    Définissez qui est responsable de chaque type de panne
                  </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openCreateDialog} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Nouvelle responsabilité
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingResponsibility ? 'Modifier la responsabilité' : 'Créer une nouvelle responsabilité'}
                      </DialogTitle>
                      <DialogDescription>
                        Définissez qui doit gérer ce type de panne
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitResponsibility} className="space-y-4">
                      <div>
                        <Label htmlFor="faultType">Type de panne</Label>
                        <Input
                          id="faultType"
                          value={formData.faultType}
                          onChange={(e) => setFormData({...formData, faultType: e.target.value})}
                          placeholder="Ex: Panne électrique, Problème mécanique..."
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="escalationDelay">Délai d'escalade (heures)</Label>
                          <Input
                            id="escalationDelay"
                            type="number"
                            min="1"
                            value={formData.escalationDelay}
                            onChange={(e) => setFormData({...formData, escalationDelay: parseInt(e.target.value)})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="priority">Priorité</Label>
                          <Select 
                            value={formData.priority} 
                            onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
                              setFormData({...formData, priority: value})
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une priorité" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Faible</SelectItem>
                              <SelectItem value="medium">Moyenne</SelectItem>
                              <SelectItem value="high">Élevée</SelectItem>
                              <SelectItem value="critical">Critique</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>Utilisateurs responsables</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto border rounded-md p-3">
                          {users.map(user => (
                            <div 
                              key={user.id} 
                              className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-accent ${
                                formData.responsibleUsers.includes(user.id) ? 'bg-primary/10' : ''
                              }`}
                              onClick={() => toggleUserResponsibility(user.id)}
                            >
                              <input
                                type="checkbox"
                                checked={formData.responsibleUsers.includes(user.id)}
                                onChange={() => toggleUserResponsibility(user.id)}
                                className="rounded"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {user.role} - {user.department}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Annuler
                        </Button>
                        <Button type="submit">
                          {editingResponsibility ? 'Modifier' : 'Créer'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {responsibilities.map((resp) => (
                  <Card key={resp.id} className="border border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <AlertTriangle className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold">{resp.faultType}</h3>
                            <Badge className={getPriorityColor(resp.priority)}>
                              {resp.priority}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Responsables:</span>
                              <div className="flex flex-wrap gap-1">
                                {resp.responsibleUsers.map(userId => (
                                  <Badge key={userId} variant="outline" className="text-xs">
                                    {getUserName(userId)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Délai d'escalade:</span>
                              <span className="font-medium">{resp.escalationDelay}h</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditResponsibility(resp)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteResponsibility(resp.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {responsibilities.length === 0 && (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune responsabilité définie</h3>
                    <p className="text-muted-foreground mb-4">
                      Commencez par définir qui gère chaque type de panne.
                    </p>
                    <Button onClick={openCreateDialog}>
                      <Plus className="w-4 h-4 mr-2" />
                      Créer une responsabilité
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;