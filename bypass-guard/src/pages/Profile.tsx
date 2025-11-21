import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, Shield, Calendar, Eye, EyeOff, Save, Edit, Lock } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { toast } from 'sonner';
import api from '../axios';

const Profile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'director': return 'Approbateur N2';
      case 'supervisor': return 'Approbateur N1';
      case 'user': return 'Demandeur';
      case 'administrator': return 'Administrateur';
      default: return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'administrator': return 'destructive';
      case 'supervisor': return 'default';
      case 'director': return 'secondary';
      case 'user': return 'outline';
      default: return 'outline';
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Vérifier que les mots de passe correspondent si un nouveau mot de passe est fourni
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        toast.error('Les mots de passe ne correspondent pas');
        setIsLoading(false);
        return;
      }

      // Préparer les données à envoyer
      const updateData: any = {
        full_name: formData.full_name,
        email: formData.email,
      };

      if (formData.phone) {
        updateData.phone = formData.phone;
      }

      // Si un nouveau mot de passe est fourni, inclure les mots de passe
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          toast.error('Veuillez entrer votre mot de passe actuel');
          setIsLoading(false);
          return;
        }
        updateData.current_password = formData.currentPassword;
        updateData.password = formData.newPassword;
      }

      // Appel API pour mettre à jour le profil
      const response = await api.put(`/users/${user?.id}`, updateData);
      
      if (response.data) {
        toast.success('Profil mis à jour avec succès');
        setIsEditing(false);
        // Réinitialiser les champs de mot de passe
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error('Erreur lors de la mise à jour du profil');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Aucune information utilisateur disponible.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mon Profil</h1>
          <p className="text-muted-foreground">Gérez vos informations personnelles</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Modifier le profil
          </Button>
        )}
      </div>

      {/* Contenu principal dans une seule Card */}
      <Card>
        <CardContent className="p-6 space-y-8">
          {/* Section 1: Informations personnelles */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Informations personnelles</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nom complet</Label>
                {isEditing ? (
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Nom complet"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{user.full_name}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Numéro de téléphone"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{formData.phone || 'Non renseigné'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{user.username}</span>
                </div>
                <p className="text-xs text-muted-foreground">Le nom d'utilisateur ne peut pas être modifié</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Section 2: Informations de compte */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Informations de compte</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Rôle</Label>
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Le rôle ne peut pas être modifié</p>
              </div>

              <div className="space-y-2">
                <Label>Statut</Label>
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <Badge variant={user.is_active ? "default" : "secondary"}>
                    {user.is_active ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Section 3: Modification du mot de passe */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Modification du mot de passe</h2>
            </div>
            {isEditing ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      placeholder="Mot de passe actuel"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      placeholder="Nouveau mot de passe"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirmer le nouveau mot de passe"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-md bg-muted">
                <p className="text-sm text-muted-foreground">
                  Cliquez sur "Modifier le profil" pour changer votre mot de passe.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          {isEditing && (
            <>
              <Separator />
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                  Annuler
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;

