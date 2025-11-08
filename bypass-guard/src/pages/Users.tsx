import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { mockUsers } from '@/data/mockUsers';
import { User, UserRole } from '@/types/user';
import { toast } from 'sonner';
import api from '../axios'
import { LogIn, Eye, EyeOff } from 'lucide-react';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    role: 'user' as UserRole,
    department: '',
    full_name: '',
    password: '',
    zone: '',
    phone: '',
    id: '',
    employeeId: ''
  });

  const departments = ['user', 'supervisor', 'director', 'administrator'];

  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.full_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || user.role === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleAddUser = () => {
    const user: User = {
      id: `user-${Date.now()}`,
      ...newUser,
      isActive: true,
      lastLogin: new Date()
    };

    api({
      method: 'post',
      url: '/users',
      data: newUser
    })
    .then(data => {
      getUsersList()
      if (data) {
        toast.success('Utilisateur ajouté avec succès');
      } else {
        toast.error('Erreur durant l\'ajout');
      }
    })
    
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      role: 'user',
      department: '',
      password: '',
      full_name: '',
      zone: '',
      phone: '',
      employeeId: '',
      username: '',
      id: ''
    });
    setIsAddDialogOpen(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      department: user.department,
      zone: user.zone,
      phone: user.phone || '',
      username: user.username,
      password: '',
      id: user.id,
      employeeId: user.employeeId
    });
  };

  const handleUpdateUser = () => {
    if (editingUser) {
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...editingUser, ...newUser }
          : user
      ));
      
      
      api({
        method: 'put',
        url: `/users/${newUser.id}`,
        data: newUser
      })
      .then(data => {
        getUsersList()
        if (data) {
          toast.success('Utilisateur modifié avec succès');
        } else {
          toast.error('Erreur lors de la modification!');
        }
      })
      setNewUser({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        role: 'user',
        full_name: '',
        password: '',
        department: '',
        zone: '',
        phone: '',
        employeeId: '',
        id: ''
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast.success('Utilisateur supprimé avec succès');
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ));
    toast.success('Statut utilisateur modifié');
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'user': return 'default';
      case 'supervisor': return 'secondary';
      case 'director': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      // case 'director': return 'Directeur';
      case 'director': return 'Approbateur N2';
      case 'supervisor': return 'Approbateur N1';
      case 'user': return 'Demandeur';
      default: return role;
    }
  };

  const getUsersList = () => {
    api.get('/users')
      .then(response => {
        // Handle successful response
        const datas = response.data.data
        if (datas.length !== 0) {
          const formattedEquips = datas.map(
            (eqs: any, index: number) => ({
              id: eqs.id,
              full_name: eqs.full_name,
              email: eqs.email,
              role: eqs.role,
              phone: eqs.phone,
              username: eqs.username,
              isActive: eqs.is_active == 1 ? true : false 
            })
          );

          console.log(formattedEquips)

          setUsers(formattedEquips)
        }
        // setRequestActifList(response.data.data)    
      })
      .catch(error => {
        // Handle error
        console.error('Error fetching data:', error);
      });
  }
  

  useEffect(() => {
    getUsersList()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">
            Gérez les utilisateurs et leurs permissions
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[725px]">
            <DialogHeader>
              <DialogTitle>Ajouter un utilisateur</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau utilisateur au système
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2 relative">
                  <Label htmlFor="phone">Mot de Passe</Label>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  />
                  <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-2 h-full px-3 py-2 hover:bg-transparent"
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
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select value={newUser.role} onValueChange={(value: UserRole) => setNewUser({...newUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Demandeur</SelectItem>
                    <SelectItem value="supervisor">Approbateur N1</SelectItem>
                    <SelectItem value="director">Approbateur N2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddUser}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>
            Filtrez la liste des utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, email ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Roles des utilisateurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les roles</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{getRoleLabel(dept)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleUserStatus(user.id)}
                    >
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Actif" : "Inactif"}
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
                            onClick={() => handleEditUser(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[625px]">
                          <DialogHeader>
                            <DialogTitle>Modifier l'utilisateur</DialogTitle>
                            <DialogDescription>
                              Modifiez les informations de l'utilisateur
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-firstName">Nom Complet</Label>
                                <Input
                                  id="edit-firstName"
                                  value={newUser.full_name}
                                  onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-firstName">Nom D'utilisateur</Label>
                                <Input
                                  id="edit-firstName"
                                  value={newUser.username}
                                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-email">Email</Label>
                              <Input
                                id="edit-email"
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                              />
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                              <div className="space-y-2 relative">
                                <Label htmlFor="phone">Mot de Passe</Label>
                                <Input
                                  id="password"
                                  type={showPassword ? 'text' : 'password'}
                                  value={newUser.password}
                                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                />
                                <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-2 h-full px-3 py-2 hover:bg-transparent"
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
                            <div className="grid grid-cols-1 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="phone">Téléphone</Label>
                                <Input
                                  id="phone"
                                  value={newUser.phone}
                                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-role">Rôle</Label>
                              <Select value={newUser.role} onValueChange={(value: UserRole) => setNewUser({...newUser, role: value})}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">Demandeur</SelectItem>
                                  <SelectItem value="supervisor">Approbateur N1</SelectItem>
                                  <SelectItem value="director">Approbateur N2</SelectItem>
                                  <SelectItem value="administrator">Adminnistrateur</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="secondary">
                                Close
                              </Button>
                            </DialogClose>
                            <Button onClick={handleUpdateUser}>Sauvegarder</Button>
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
                            <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
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

export default Users;