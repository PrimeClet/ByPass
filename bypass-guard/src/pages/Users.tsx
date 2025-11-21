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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Plus, Pencil, Trash2, Search, User as UserIcon, LayoutGrid, Table as TableIcon } from 'lucide-react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
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

  // Calcul de la pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Réinitialiser la page quand les filtres ou le nombre d'éléments par page changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDepartment, itemsPerPage]);

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
    setEditingUser(null);
    setIsAddDialogOpen(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      department: user.department || '',
      zone: user.zone || '',
      phone: user.phone || '',
      username: user.username || '',
      password: '',
      id: user.id,
      employeeId: user.employeeId || ''
    });
    setIsAddDialogOpen(true);
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
      setEditingUser(null);
      setIsAddDialogOpen(false);
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
    <div className="container mx-auto p-6 space-y-6 space-x-6">
      <div className="flex justify-between items-center p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">Gérez les utilisateurs et leurs permissions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setEditingUser(null);
            setNewUser({
              firstName: '',
              lastName: '',
              username: '',
              email: '',
              role: 'user',
              department: '',
              full_name: '',
              password: '',
              zone: '',
              phone: '',
              id: '',
              employeeId: ''
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Ajouter un utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
              </DialogTitle>
              <DialogDescription>
                {editingUser ? 'Modifiez les informations de l\'utilisateur.' : 'Ajoutez un nouveau utilisateur au système.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingUser) {
                handleUpdateUser();
              } else {
                handleAddUser();
              }
            }} className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="full_name">Nom complet</Label>
                  <Input
                    id="full_name"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                    placeholder="Nom complet de l'utilisateur"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    placeholder="Nom d'utilisateur"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="Email de l'utilisateur"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="relative">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Mot de passe"
                    required={!editingUser}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-8 h-full px-3 py-2 hover:bg-transparent"
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
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    placeholder="Numéro de téléphone"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="role">Rôle</Label>
                  <Select value={newUser.role} onValueChange={(value: UserRole) => setNewUser({...newUser, role: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Demandeur</SelectItem>
                      <SelectItem value="supervisor">Approbateur N1</SelectItem>
                      <SelectItem value="director">Approbateur N2</SelectItem>
                      <SelectItem value="administrator">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingUser(null);
                  setNewUser({
                    firstName: '',
                    lastName: '',
                    username: '',
                    email: '',
                    role: 'user',
                    department: '',
                    full_name: '',
                    password: '',
                    zone: '',
                    phone: '',
                    id: '',
                    employeeId: ''
                  });
                }}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingUser ? 'Modifier' : 'Ajouter'}
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
                  placeholder="Nom, email ou téléphone de l'utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="role-filter">Rôle</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{getRoleLabel(dept)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contrôles de pagination et sélection du nombre d'éléments */}
      {filteredUsers.length > 0 && (
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
            Affichage de {startIndex + 1} à {Math.min(endIndex, filteredUsers.length)} sur {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Liste des utilisateurs */}
      {viewMode === 'grid' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">{user.full_name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleEditUser(user);
                          setIsAddDialogOpen(true);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
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
                  </div>
                  <CardDescription>{user.email}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Nom d'utilisateur:</span>
                    <Badge variant="outline">{user.username}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rôle:</span>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Téléphone:</span>
                    <span className="text-sm">{user.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Statut:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleUserStatus(user.id)}
                      className="h-auto p-0"
                    >
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <Card className="p-12 text-center">
              <UserIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {users.length === 0 ? 'Aucun utilisateur' : 'Aucun résultat'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {users.length === 0 
                  ? 'Commencez par ajouter votre premier utilisateur.'
                  : 'Aucun utilisateur ne correspond à vos critères de recherche.'
                }
              </p>
              {users.length === 0 && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un utilisateur
                </Button>
              )}
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom complet</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Nom d'utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <UserIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        {users.length === 0 ? 'Aucun utilisateur' : 'Aucun résultat'}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {users.length === 0 
                          ? 'Commencez par ajouter votre premier utilisateur.'
                          : 'Aucun utilisateur ne correspond à vos critères de recherche.'
                        }
                      </p>
                      {users.length === 0 && (
                        <Button onClick={() => setIsAddDialogOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Ajouter un utilisateur
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.full_name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.phone || 'N/A'}</TableCell>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              handleEditUser(user);
                              setIsAddDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
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
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {filteredUsers.length > 0 && totalPages > 1 && (
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

export default Users;