import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Edit2, Shield, Save, Key, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import api from '../axios';
import { UserPermissions } from '@/types/user';
import { Link } from 'react-router-dom';

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
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 overflow-x-hidden box-border">
      {/* Header avec breadcrumb */}
      <Card className="bg-card rounded-lg border">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Icône */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                <Key className="w-6 h-6 text-white" />
              </div>
              {/* Titre, description et breadcrumb */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground break-words mb-1">Gestion des Rôles et Permissions</h1>
                <p className="text-xs sm:text-sm text-muted-foreground break-words mb-2">Configurez les permissions pour chaque rôle</p>
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link to="/">Tableau de bord</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Rôles et Permissions</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>
            {/* Bouton retour */}
            <Button variant="outline" size="icon" className="flex-shrink-0 rounded-full w-10 h-10" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog pour modifier les permissions */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setEditingRole(null);
        }
      }}>
        <DialogContent className="max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              Modifier les permissions - {editingRole?.name}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Ajoutez ou retirez des permissions pour le rôle "{editingRole?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4 w-full min-w-0">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm text-muted-foreground">Code: <span className="font-medium">{editingRole?.code}</span></Label>
              <p className="text-xs sm:text-sm text-muted-foreground">{editingRole?.description}</p>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <Label className="text-sm sm:text-base font-semibold">Permissions</Label>
              
              {/* Permissions générales */}
              <div className="space-y-2 sm:space-y-3 border rounded-lg p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Permissions générales</h4>
                {allPermissions.filter(p => 
                  !p.key.includes('Equipment') && 
                  !p.key.includes('User') && 
                  !p.key.includes('Zone') && 
                  !p.key.includes('Sensor')
                ).map((permission) => (
                  <div key={permission.key} className="flex items-start space-x-2 sm:space-x-3 min-w-0">
                    <Checkbox
                      id={permission.key}
                      checked={editingPermissions[permission.key]}
                      onCheckedChange={() => togglePermission(permission.key)}
                      className="mt-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Label 
                        htmlFor={permission.key}
                        className="text-xs sm:text-sm font-medium cursor-pointer break-words"
                      >
                        {permission.label}
                      </Label>
                      <p className="text-xs text-muted-foreground break-words">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Permissions Zones */}
              <div className="space-y-2 sm:space-y-3 border rounded-lg p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Zones</h4>
                {allPermissions.filter(p => p.key.includes('Zone')).map((permission) => (
                  <div key={permission.key} className="flex items-start space-x-2 sm:space-x-3 min-w-0">
                    <Checkbox
                      id={permission.key}
                      checked={editingPermissions[permission.key]}
                      onCheckedChange={() => togglePermission(permission.key)}
                      className="mt-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Label 
                        htmlFor={permission.key}
                        className="text-xs sm:text-sm font-medium cursor-pointer break-words"
                      >
                        {permission.label}
                      </Label>
                      <p className="text-xs text-muted-foreground break-words">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Permissions Équipements */}
              <div className="space-y-2 sm:space-y-3 border rounded-lg p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Équipements</h4>
                {allPermissions.filter(p => p.key.includes('Equipment')).map((permission) => (
                  <div key={permission.key} className="flex items-start space-x-2 sm:space-x-3 min-w-0">
                    <Checkbox
                      id={permission.key}
                      checked={editingPermissions[permission.key]}
                      onCheckedChange={() => togglePermission(permission.key)}
                      className="mt-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Label 
                        htmlFor={permission.key}
                        className="text-xs sm:text-sm font-medium cursor-pointer break-words"
                      >
                        {permission.label}
                      </Label>
                      <p className="text-xs text-muted-foreground break-words">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Permissions Utilisateurs */}
              <div className="space-y-2 sm:space-y-3 border rounded-lg p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Utilisateurs</h4>
                {allPermissions.filter(p => p.key.includes('User')).map((permission) => (
                  <div key={permission.key} className="flex items-start space-x-2 sm:space-x-3 min-w-0">
                    <Checkbox
                      id={permission.key}
                      checked={editingPermissions[permission.key]}
                      onCheckedChange={() => togglePermission(permission.key)}
                      className="mt-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Label 
                        htmlFor={permission.key}
                        className="text-xs sm:text-sm font-medium cursor-pointer break-words"
                      >
                        {permission.label}
                      </Label>
                      <p className="text-xs text-muted-foreground break-words">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Permissions Capteurs */}
              <div className="space-y-2 sm:space-y-3 border rounded-lg p-3 sm:p-4">
                <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Capteurs</h4>
                {allPermissions.filter(p => p.key.includes('Sensor')).map((permission) => (
                  <div key={permission.key} className="flex items-start space-x-2 sm:space-x-3 min-w-0">
                    <Checkbox
                      id={permission.key}
                      checked={editingPermissions[permission.key]}
                      onCheckedChange={() => togglePermission(permission.key)}
                      className="mt-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Label 
                        htmlFor={permission.key}
                        className="text-xs sm:text-sm font-medium cursor-pointer break-words"
                      >
                        {permission.label}
                      </Label>
                      <p className="text-xs text-muted-foreground break-words">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsDialogOpen(false);
                setEditingRole(null);
              }}
              disabled={isLoading}
              className="w-full sm:w-auto text-sm"
            >
              Annuler
            </Button>
            <Button onClick={handleSavePermissions} disabled={isLoading} className="w-full sm:w-auto text-sm">
              <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
              {isLoading ? 'Enregistrement...' : 'Enregistrer les permissions'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Liste des rôles */}
      <Card className="w-full min-w-0 box-border">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            Rôles ({roles.length})
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Liste des rôles et leurs permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-3 w-full min-w-0 overflow-hidden box-border">
          <div className="w-full min-w-0 overflow-x-hidden box-border">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm min-w-0 w-[20%] sm:w-auto">Nom</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden sm:table-cell min-w-0 w-[15%]">Code</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell min-w-0 w-[25%]">Description</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden lg:table-cell min-w-0 w-[10%]">Utilisateurs</TableHead>
                  <TableHead className="text-xs sm:text-sm min-w-0 w-[20%] sm:w-auto">Permissions</TableHead>
                  <TableHead className="text-xs sm:text-sm text-right min-w-0 w-[15%] sm:w-auto">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 sm:py-8">
                      <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-base sm:text-lg font-semibold mb-2">Aucun rôle</h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        Les rôles sont prédéfinis dans le système.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium text-xs sm:text-sm min-w-0 overflow-hidden">
                        <div className="flex flex-col sm:block min-w-0">
                          <span className="truncate sm:whitespace-normal">{role.name}</span>
                          <span className="text-xs text-muted-foreground sm:hidden mt-1 truncate">{role.code}</span>
                          <span className="text-xs text-muted-foreground md:hidden mt-1 line-clamp-2">{role.description}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell min-w-0 overflow-hidden">
                        <Badge variant="outline" className="text-xs whitespace-nowrap">{role.code}</Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm hidden md:table-cell truncate min-w-0 overflow-hidden max-w-[200px]">{role.description}</TableCell>
                      <TableCell className="hidden lg:table-cell min-w-0 overflow-hidden">
                        <Badge variant="secondary" className="text-xs sm:text-sm whitespace-nowrap">{role.userCount || 0}</Badge>
                      </TableCell>
                      <TableCell className="min-w-0 overflow-hidden">
                        <div className="flex flex-wrap gap-0.5 sm:gap-1">
                          {Object.entries(role.permissions)
                            .filter(([_, value]) => value)
                            .slice(0, 2)
                            .map(([key]) => {
                              const perm = allPermissions.find(p => p.key === key);
                              return perm ? (
                                <Badge key={key} variant="outline" className="text-xs truncate max-w-[80px] sm:max-w-none">
                                  <span className="hidden sm:inline">{perm.label}</span>
                                  <span className="sm:hidden">{perm.label.split(' ')[0]}</span>
                                </Badge>
                              ) : null;
                            })}
                          {Object.values(role.permissions).filter(Boolean).length > 2 && (
                            <Badge variant="outline" className="text-xs whitespace-nowrap">
                              +{Object.values(role.permissions).filter(Boolean).length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right min-w-0 overflow-hidden">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPermissions(role)}
                          className="text-xs sm:text-sm h-7 sm:h-8 p-1 sm:p-2"
                        >
                          <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Modifier les permissions</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default RolesPermissions;

