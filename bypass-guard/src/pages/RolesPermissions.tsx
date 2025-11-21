import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit2, Shield, Check, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import api from '../axios';
import { UserPermissions } from '@/types/user';

interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  permissions: UserPermissions;
  userCount?: number;
}

const allPermissions: Array<{ key: keyof UserPermissions; label: string; description: string }> = [
  // Permissions générales
  { key: 'canSubmitRequest', label: 'Soumettre des demandes', description: 'Permet de créer de nouvelles demandes de bypass' },
  { key: 'canApproveLevel1', label: 'Approbation niveau 1', description: 'Permet d\'approuver les demandes de niveau 1' },
  { key: 'canApproveLevel2', label: 'Approbation niveau 2', description: 'Permet d\'approuver les demandes de niveau 2' },
  { key: 'canViewAllRequests', label: 'Consulter toutes les demandes', description: 'Permet de voir toutes les demandes du système' },
  { key: 'canExportData', label: 'Exporter les données', description: 'Permet d\'exporter les données du système' },
  { key: 'canViewAuditLog', label: 'Journal d\'audit', description: 'Permet de consulter le journal d\'audit' },
  { key: 'canReceiveNotifications', label: 'Recevoir les notifications', description: 'Permet de recevoir les notifications système' },
  { key: 'canManageSettings', label: 'Gérer les paramètres', description: 'Permet de modifier les paramètres système' },
  { key: 'canRejectRequest', label: 'Rejeter des demandes', description: 'Permet de rejeter des demandes de bypass' },
  { key: 'canCancelRequest', label: 'Annuler des demandes', description: 'Permet d\'annuler des demandes de bypass' },
  { key: 'canViewDashboard', label: 'Voir le tableau de bord', description: 'Permet d\'accéder au tableau de bord' },
  { key: 'canManageRoles', label: 'Gérer les rôles', description: 'Permet de gérer les rôles et leurs permissions' },
  // Permissions pour les équipements
  { key: 'canViewEquipment', label: 'Voir les équipements', description: 'Permet de consulter la liste des équipements' },
  { key: 'canCreateEquipment', label: 'Créer des équipements', description: 'Permet de créer de nouveaux équipements' },
  { key: 'canUpdateEquipment', label: 'Modifier des équipements', description: 'Permet de modifier des équipements existants' },
  { key: 'canDeleteEquipment', label: 'Supprimer des équipements', description: 'Permet de supprimer des équipements' },
  // Permissions pour les utilisateurs
  { key: 'canViewUser', label: 'Voir les utilisateurs', description: 'Permet de consulter la liste des utilisateurs' },
  { key: 'canCreateUser', label: 'Créer des utilisateurs', description: 'Permet de créer de nouveaux utilisateurs' },
  { key: 'canUpdateUser', label: 'Modifier des utilisateurs', description: 'Permet de modifier des utilisateurs existants' },
  { key: 'canDeleteUser', label: 'Supprimer des utilisateurs', description: 'Permet de supprimer des utilisateurs' },
  // Permissions pour les zones
  { key: 'canViewZone', label: 'Voir les zones', description: 'Permet de consulter la liste des zones' },
  { key: 'canCreateZone', label: 'Créer des zones', description: 'Permet de créer de nouvelles zones' },
  { key: 'canUpdateZone', label: 'Modifier des zones', description: 'Permet de modifier des zones existantes' },
  { key: 'canDeleteZone', label: 'Supprimer des zones', description: 'Permet de supprimer des zones' },
  // Permissions pour les capteurs
  { key: 'canViewSensor', label: 'Voir les capteurs', description: 'Permet de consulter la liste des capteurs' },
  { key: 'canCreateSensor', label: 'Créer des capteurs', description: 'Permet de créer de nouveaux capteurs' },
  { key: 'canUpdateSensor', label: 'Modifier des capteurs', description: 'Permet de modifier des capteurs existants' },
  { key: 'canDeleteSensor', label: 'Supprimer des capteurs', description: 'Permet de supprimer des capteurs' },
];

const RolesPermissions: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<UserPermissions>({
    canSubmitRequest: false,
    canApproveLevel1: false,
    canApproveLevel2: false,
    canViewAllRequests: false,
    canExportData: false,
    canViewAuditLog: false,
    canReceiveNotifications: false,
    canManageSettings: false,
    canRejectRequest: false,
    canCancelRequest: false,
    canViewDashboard: false,
    canManageRoles: false,
    canViewEquipment: false,
    canCreateEquipment: false,
    canUpdateEquipment: false,
    canDeleteEquipment: false,
    canViewUser: false,
    canCreateUser: false,
    canUpdateUser: false,
    canDeleteUser: false,
    canViewZone: false,
    canCreateZone: false,
    canUpdateZone: false,
    canDeleteZone: false,
    canViewSensor: false,
    canCreateSensor: false,
    canUpdateSensor: false,
    canDeleteSensor: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      // Rôles par défaut avec leurs permissions
      const defaultRoles: Role[] = [
        {
          id: '1',
          name: 'Demandeur',
          code: 'user',
          description: 'Utilisateur standard pouvant soumettre des demandes',
          permissions: {
            canSubmitRequest: true,
            canApproveLevel1: false,
            canApproveLevel2: false,
            canViewAllRequests: false,
            canExportData: false,
            canViewAuditLog: false,
            canReceiveNotifications: true,
            canManageSettings: false,
            canRejectRequest: false,
            canCancelRequest: false,
            canViewDashboard: false,
            canManageRoles: false,
            canViewEquipment: false,
            canCreateEquipment: false,
            canUpdateEquipment: false,
            canDeleteEquipment: false,
            canViewUser: false,
            canCreateUser: false,
            canUpdateUser: false,
            canDeleteUser: false,
            canViewZone: false,
            canCreateZone: false,
            canUpdateZone: false,
            canDeleteZone: false,
            canViewSensor: false,
            canCreateSensor: false,
            canUpdateSensor: false,
            canDeleteSensor: false,
          },
          userCount: 0
        },
        {
          id: '2',
          name: 'Approbateur N1',
          code: 'supervisor',
          description: 'Superviseur pouvant approuver les demandes de niveau 1',
          permissions: {
            canSubmitRequest: true,
            canApproveLevel1: true,
            canApproveLevel2: false,
            canViewAllRequests: true,
            canExportData: true,
            canViewAuditLog: true,
            canReceiveNotifications: true,
            canManageSettings: false,
            canRejectRequest: true,
            canCancelRequest: false,
            canViewDashboard: true,
            canManageRoles: false,
            canViewEquipment: true,
            canCreateEquipment: false,
            canUpdateEquipment: false,
            canDeleteEquipment: false,
            canViewUser: true,
            canCreateUser: false,
            canUpdateUser: false,
            canDeleteUser: false,
            canViewZone: true,
            canCreateZone: false,
            canUpdateZone: false,
            canDeleteZone: false,
            canViewSensor: true,
            canCreateSensor: false,
            canUpdateSensor: false,
            canDeleteSensor: false,
          },
          userCount: 0
        },
        {
          id: '3',
          name: 'Approbateur N2',
          code: 'director',
          description: 'Directeur pouvant approuver les demandes de niveau 2',
          permissions: {
            canSubmitRequest: true,
            canApproveLevel1: true,
            canApproveLevel2: true,
            canViewAllRequests: true,
            canExportData: true,
            canViewAuditLog: true,
            canReceiveNotifications: true,
            canManageSettings: false,
            canRejectRequest: true,
            canCancelRequest: true,
            canViewDashboard: true,
            canManageRoles: false,
            canViewEquipment: true,
            canCreateEquipment: true,
            canUpdateEquipment: true,
            canDeleteEquipment: false,
            canViewUser: true,
            canCreateUser: false,
            canUpdateUser: false,
            canDeleteUser: false,
            canViewZone: true,
            canCreateZone: false,
            canUpdateZone: false,
            canDeleteZone: false,
            canViewSensor: true,
            canCreateSensor: true,
            canUpdateSensor: true,
            canDeleteSensor: false,
          },
          userCount: 0
        },
        {
          id: '4',
          name: 'Administrateur',
          code: 'administrator',
          description: 'Administrateur avec tous les droits',
          permissions: {
            canSubmitRequest: false,
            canApproveLevel1: false,
            canApproveLevel2: false,
            canViewAllRequests: true,
            canExportData: true,
            canViewAuditLog: true,
            canReceiveNotifications: true,
            canManageSettings: true,
            canRejectRequest: true,
            canCancelRequest: true,
            canViewDashboard: true,
            canManageRoles: true,
            canViewEquipment: true,
            canCreateEquipment: true,
            canUpdateEquipment: true,
            canDeleteEquipment: true,
            canViewUser: true,
            canCreateUser: true,
            canUpdateUser: true,
            canDeleteUser: true,
            canViewZone: true,
            canCreateZone: true,
            canUpdateZone: true,
            canDeleteZone: true,
            canViewSensor: true,
            canCreateSensor: true,
            canUpdateSensor: true,
            canDeleteSensor: true,
          },
          userCount: 0
        }
      ];

      // TODO: Remplacer par un appel API réel
      // const response = await api.get('/roles');
      // setRoles(response.data.data);
      
      setRoles(defaultRoles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Erreur lors du chargement des rôles');
    }
  };

  const handleSavePermissions = async () => {
    if (!editingRole) return;

    setIsLoading(true);
    try {
      // Mise à jour des permissions du rôle
      // await api.put(`/roles/${editingRole.id}/permissions`, editingPermissions);
      
      setRoles(roles.map(role => 
        role.id === editingRole.id 
          ? { ...role, permissions: { ...editingPermissions } }
          : role
      ));
      
      toast.success('Permissions mises à jour avec succès');
      setIsDialogOpen(false);
      setEditingRole(null);
    } catch (error: any) {
      console.error('Error saving permissions:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde des permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPermissions = (role: Role) => {
    setEditingRole(role);
    setEditingPermissions({ ...role.permissions });
    setIsDialogOpen(true);
  };

  const togglePermission = (permissionKey: keyof UserPermissions) => {
    setEditingPermissions(prev => ({
      ...prev,
      [permissionKey]: !prev[permissionKey]
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestion des Rôles et Permissions</h1>
        <p className="text-muted-foreground">Configurez les permissions pour chaque rôle</p>
      </div>

      {/* Dialog pour modifier les permissions */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setEditingRole(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Modifier les permissions - {editingRole?.name}
            </DialogTitle>
            <DialogDescription>
              Ajoutez ou retirez des permissions pour le rôle "{editingRole?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Code: <span className="font-medium">{editingRole?.code}</span></Label>
              <p className="text-sm text-muted-foreground">{editingRole?.description}</p>
            </div>
            <div className="space-y-4">
              <Label className="text-base font-semibold">Permissions</Label>
              
              {/* Permissions générales */}
              <div className="space-y-3 border rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-3">Permissions générales</h4>
                {allPermissions.filter(p => 
                  !p.key.includes('Equipment') && 
                  !p.key.includes('User') && 
                  !p.key.includes('Zone') && 
                  !p.key.includes('Sensor')
                ).map((permission) => (
                  <div key={permission.key} className="flex items-start space-x-3">
                    <Checkbox
                      id={permission.key}
                      checked={editingPermissions[permission.key]}
                      onCheckedChange={() => togglePermission(permission.key)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor={permission.key}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {permission.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Permissions Zones */}
              <div className="space-y-3 border rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-3">Zones</h4>
                {allPermissions.filter(p => p.key.includes('Zone')).map((permission) => (
                  <div key={permission.key} className="flex items-start space-x-3">
                    <Checkbox
                      id={permission.key}
                      checked={editingPermissions[permission.key]}
                      onCheckedChange={() => togglePermission(permission.key)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor={permission.key}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {permission.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Permissions Équipements */}
              <div className="space-y-3 border rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-3">Équipements</h4>
                {allPermissions.filter(p => p.key.includes('Equipment')).map((permission) => (
                  <div key={permission.key} className="flex items-start space-x-3">
                    <Checkbox
                      id={permission.key}
                      checked={editingPermissions[permission.key]}
                      onCheckedChange={() => togglePermission(permission.key)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor={permission.key}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {permission.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Permissions Utilisateurs */}
              <div className="space-y-3 border rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-3">Utilisateurs</h4>
                {allPermissions.filter(p => p.key.includes('User')).map((permission) => (
                  <div key={permission.key} className="flex items-start space-x-3">
                    <Checkbox
                      id={permission.key}
                      checked={editingPermissions[permission.key]}
                      onCheckedChange={() => togglePermission(permission.key)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor={permission.key}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {permission.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Permissions Capteurs */}
              <div className="space-y-3 border rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-3">Capteurs</h4>
                {allPermissions.filter(p => p.key.includes('Sensor')).map((permission) => (
                  <div key={permission.key} className="flex items-start space-x-3">
                    <Checkbox
                      id={permission.key}
                      checked={editingPermissions[permission.key]}
                      onCheckedChange={() => togglePermission(permission.key)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor={permission.key}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {permission.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsDialogOpen(false);
                setEditingRole(null);
              }}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button onClick={handleSavePermissions} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Enregistrement...' : 'Enregistrer les permissions'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Liste des rôles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Rôles ({roles.length})
          </CardTitle>
          <CardDescription>
            Liste des rôles et leurs permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Utilisateurs</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun rôle</h3>
                    <p className="text-muted-foreground">
                      Les rôles sont prédéfinis dans le système.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{role.code}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{role.description}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{role.userCount || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(role.permissions)
                          .filter(([_, value]) => value)
                          .slice(0, 3)
                          .map(([key]) => {
                            const perm = allPermissions.find(p => p.key === key);
                            return perm ? (
                              <Badge key={key} variant="outline" className="text-xs">
                                {perm.label}
                              </Badge>
                            ) : null;
                          })}
                        {Object.values(role.permissions).filter(Boolean).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{Object.values(role.permissions).filter(Boolean).length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPermissions(role)}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Modifier les permissions
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Matrice des permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Matrice des Permissions</CardTitle>
          <CardDescription>
            Vue d'ensemble des permissions par rôle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Permission</TableHead>
                  {roles.map((role) => (
                    <TableHead key={role.id} className="text-center min-w-[120px]">
                      {role.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {allPermissions.map((permission) => (
                  <TableRow key={permission.key}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{permission.label}</div>
                        <div className="text-xs text-muted-foreground">{permission.description}</div>
                      </div>
                    </TableCell>
                    {roles.map((role) => (
                      <TableCell key={role.id} className="text-center">
                        {role.permissions[permission.key] ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RolesPermissions;

