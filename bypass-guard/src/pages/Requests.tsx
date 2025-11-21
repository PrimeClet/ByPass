import { useState, useEffect } from "react"
import { useLocation, Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { 
  Search, 
  Filter, 
  Plus,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  ArrowLeft
} from "lucide-react"
import { BypassRequestForm } from "@/components/forms/BypassRequestForm"
import { RequestDetailsModal } from "@/components/RequestDetailsModal"
import api from '../axios'
import type { Equipment, EquipmentType, EquipmentStatus, CriticalityLevel, Zone } from '@/types/equipment';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';


const mockRequests = [
  {
    id: "BR-2024-001",
    equipment: "Ligne de production A",
    sensor: "Capteur de pression #12",
    requester: "Marie Martin",
    priority: "Haute",
    status: "En attente",
    date: "2024-01-15",
    reason: "Maintenance préventive"
  },
  {
    id: "BR-2024-002",
    equipment: "Four industriel B", 
    sensor: "Capteur de température #8",
    requester: "Pierre Dubois",
    priority: "Moyenne",
    status: "Approuvé",
    date: "2024-01-14",
    reason: "Étalonnage capteur"
  },
  {
    id: "BR-2024-003",
    equipment: "Compresseur C",
    sensor: "Capteur de vibration #3",
    requester: "Sophie Leroy",
    priority: "Faible",
    status: "En cours",
    date: "2024-01-13",
    reason: "Test de fonctionnement"
  },
  {
    id: "BR-2024-004",
    equipment: "Pompe hydraulique D",
    sensor: "Capteur de débit #15",
    requester: "Marc Dubois",
    priority: "Haute",
    status: "Rejeté",
    date: "2024-01-12",
    reason: "Remplacement pièce"
  }
]

export default function Requests() {
  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [requestList, setRequestList] = useState([]);
  const [requestDemand, setRequestDemandList] = useState([]);
  const [requestApprobation, setRequestApprobationList] = useState([]);
  const [requestActifs, setRequestActifList] = useState([]);
  const { users, loading, error, user } = useSelector((state: RootState) => state.user);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [activeTab, setActiveTab] = useState(user.role !== 'user' ? "mine" : "mine");
  // Déterminer quelle vue afficher selon l'URL
  const isNewRequest = location.pathname === '/requests/new'

  const filteredRequests = requestList.filter(request => {
    const matchesSearch = request.equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.request_code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const filteredDemand = (requestDemand ?? []).filter(request => {
    const matchesSearch = request.equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.request_code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const filteredApprobation = (requestApprobation ?? []).filter(request => {
    const matchesSearch = request.equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.request_code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const filteredActifs = (requestActifs ?? []).filter(request => {
    const matchesSearch = request.equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.request_code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Fonction pour obtenir la liste filtrée selon l'onglet actif
  const getFilteredList = () => {
    switch (activeTab) {
      case "all":
        return filteredRequests;
      case "mine":
        return filteredDemand;
      case "pending":
        return filteredApprobation;
      case "active":
        return filteredActifs;
      default:
        return filteredDemand;
    }
  }

  const currentFilteredList = getFilteredList();

  // Calcul de la pagination
  const totalPages = Math.ceil(currentFilteredList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedList = currentFilteredList.slice(startIndex, endIndex);

  // Réinitialiser la page quand les filtres, l'onglet ou le nombre d'éléments par page changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, priorityFilter, activeTab, itemsPerPage]);



  useEffect(() => {
    

    if(user.role === 'administrator' || user.role === 'supervisor'){
        api.get('/dashboard/recent-requests')
        .then(response => {
          // Handle successful response
          console.log(response.data); // The fetched data is typically in response.data
          setRequestList(response.data)    
        })
        .catch(error => {
          // Handle error
          console.error('Error fetching data:', error);
        });

        api.get('/requests/pending')
        .then(response => {
          // Handle successful response
          // console.log(response.data); // The fetched data is typically in response.data
          setRequestApprobationList(response.data.data)    
        })
        .catch(error => {
          // Handle error
          console.error('Error fetching data:', error);
        });

        api.get('/requests/active')
        .then(response => {
          // Handle successful response
          // console.log(response.data); // The fetched data is typically in response.data
          setRequestActifList(response.data.data)    
        })
        .catch(error => {
          // Handle error
          console.error('Error fetching data:', error);
        });
    }
    
    api.get('/requests/mine')
    .then(response => {
      // Handle successful response
      // console.log(response.data); // The fetched data is typically in response.data
      setRequestDemandList(response.data.data)    
    })
    .catch(error => {
      // Handle error
      console.error('Error fetching data:', error);
    });
    
    
    
    

  }, [location.key])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Haute": return "bg-destructive text-destructive-foreground"
      case "high": return "bg-destructive text-destructive-foreground"
      case "Moyenne": return "bg-warning text-warning-foreground"
      case "medium": return "bg-warning text-warning-foreground"
      case "Faible": return "bg-success text-success-foreground"
      case "low": return "bg-success text-success-foreground"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "En attente": return "bg-warning text-warning-foreground"
      case "pending": return "bg-warning text-warning-foreground"
      case "Approuvé": return "bg-success text-success-foreground"
      case "approved": return "bg-success text-success-foreground"
      case "En cours": return "bg-primary text-primary-foreground"
      case "in_progress": return "bg-primary text-primary-foreground"
      default: return "bg-muted text-muted-foreground"
    }
  }
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "En attente": return <Clock className="w-4 h-4" />
      case "pending": return <Clock className="w-4 h-4" />
      case "Approuvé": return <CheckCircle className="w-4 h-4" />
      case "approved": return <CheckCircle className="w-4 h-4" />
      case "En cours": return <AlertTriangle className="w-4 h-4" />
      case "in_progress": return <AlertTriangle className="w-4 h-4" />
      case "Rejeté": return <XCircle className="w-4 h-4" />
      case "rejected": return <XCircle className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }


  const resetFilter = () =>{
    setSearchTerm("")
    setStatusFilter("all")
    setPriorityFilter("all")
  }

  // Si on est sur /requests/new, afficher le formulaire
  if (isNewRequest) {
    return (
      <div className="flex-1 space-y-6 p-6">
        {/* Header avec navigation retour */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/requests">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux demandes
            </Link>
          </Button>
          <div className="text-center lg:text-left">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              Nouvelle demande de bypass
            </h1>
            <p className="text-sm lg:text-base text-muted-foreground">
              Créer une nouvelle demande de bypass de capteur
            </p>
          </div>
        </div>

        {/* Formulaire de nouvelle demande */}
        <BypassRequestForm />
      </div>
    )
  }

  // Sinon, afficher la liste des demandes
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des demandes</h1>
          <p className="text-muted-foreground">
            Suivi et gestion des demandes de bypass
          </p>
        </div>
        <Button asChild>
          <Link to="/requests/new">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle demande
          </Link>
        </Button>
      </div>

      {/* Onglets de navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {(user.role === "administrator") && (
            <TabsTrigger value="all" onClick={resetFilter}>Toutes les demandes</TabsTrigger>
          )}
          <TabsTrigger value="mine" onClick={resetFilter}>Mes demandes</TabsTrigger>
          {(user.role === "administrator" || user.role === "supervisor") && (
            <>
              <TabsTrigger value="pending" onClick={resetFilter}>En attente d'approbation</TabsTrigger>
              <TabsTrigger value="active" onClick={resetFilter}>Bypass actifs</TabsTrigger>
            </>
          )}
          
        </TabsList>

        {(user.role === "administrator") && (
          <TabsContent value="all" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="in_progress">En cours</SelectItem>
                      <SelectItem value="approuved">Approuvé</SelectItem>
                      <SelectItem value="rejected">Rejeté</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priorité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les priorités</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="low">Faible</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    setPriorityFilter("all")
                  }}>
                    Réinitialiser filtres
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contrôles de pagination et sélection du nombre d'éléments */}
            {filteredRequests.length > 0 && (
              <div className="flex justify-between items-center">
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
                  Affichage de {startIndex + 1} à {Math.min(endIndex, filteredRequests.length)} sur {filteredRequests.length} demande{filteredRequests.length > 1 ? 's' : ''}
                </div>
              </div>
            )}

            {/* Requests list */}
            <Card>
              <CardHeader>
                <CardTitle>Demandes ({filteredRequests.length})</CardTitle>
                <CardDescription>
                  Liste des demandes de bypass
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeTab === "all" && paginatedList.map((request) => (
                    <div 
                      key={request.id} 
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                          {getStatusIcon(request.status)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{request.request_code}</span>
                            <Badge variant="outline" className={getPriorityColor(request.priority)}>
                              {request.priority}
                            </Badge>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{request.equipment.name}</p>
                          <p className="text-xs text-muted-foreground">{request.sensor.name}</p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-medium">{request.requester.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                        {new Date(request.created_at).toLocaleString("fr-FR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                        </p>
                        
                        <p className="text-xs text-muted-foreground">{request.description}</p>
                      </div>
                      <RequestDetailsModal request={request} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pagination */}
            {filteredRequests.length > 0 && totalPages > 1 && (
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
          </TabsContent>
            
        )}

        

        {/* Autres onglets avec contenu similaire filtré */}
        <TabsContent value="mine" className="space-y-6">
          {requestDemand.length === 0 ? (<Card >
              <CardHeader>
                <CardTitle>Mes demandes</CardTitle>
                <CardDescription>
                  Vos demandes de bypass
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Aucune demande.
                </p>
              </CardContent>
            </Card>) : 
            (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      Filtres
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Rechercher..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les statuts</SelectItem>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="in_progress">En cours</SelectItem>
                          <SelectItem value="approuved">Approuvé</SelectItem>
                          <SelectItem value="rejected">Rejeté</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Priorité" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les priorités</SelectItem>
                          <SelectItem value="high">Haute</SelectItem>
                          <SelectItem value="medium">Moyenne</SelectItem>
                          <SelectItem value="low">Faible</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" onClick={() => {
                        setSearchTerm("")
                        setStatusFilter("all")
                        setPriorityFilter("all")
                      }}>
                        Réinitialiser filtres
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Contrôles de pagination et sélection du nombre d'éléments */}
                {filteredDemand.length > 0 && (
                  <div className="flex justify-between items-center">
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
                      Affichage de {startIndex + 1} à {Math.min(endIndex, filteredDemand.length)} sur {filteredDemand.length} demande{filteredDemand.length > 1 ? 's' : ''}
                    </div>
                  </div>
                )}

                {/* Requests list */}
                <Card>
                  <CardHeader>
                    <CardTitle>Demandes ({filteredDemand.length})</CardTitle>
                    <CardDescription>
                      Liste des demandes de bypass
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activeTab === "mine" && paginatedList.map((request) => (
                        <div 
                          key={request.id} 
                          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                              {getStatusIcon(request.status)}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{request.request_code}</span>
                                <Badge variant="outline" className={getPriorityColor(request.priority)}>
                                  {request.priority}
                                </Badge>
                                <Badge className={getStatusColor(request.status)}>
                                  {request.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{request.equipment.name}</p>
                              <p className="text-xs text-muted-foreground">{request.sensor.name}</p>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="text-sm font-medium">{request.requester ? request.requester.full_name : 'Moi'}</p>
                            <p className="text-xs text-muted-foreground">
                            {new Date(request.created_at).toLocaleString("fr-FR", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                            </p>
                            
                            <p className="text-xs text-muted-foreground">{request.description}</p>
                          </div>
                          <RequestDetailsModal request={request} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Pagination */}
                {filteredDemand.length > 0 && totalPages > 1 && (
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
              </>
            )}
        </TabsContent>

        {(user.role === "administrator" || user.role === "supervisor") && (
          <>
            <TabsContent value="pending" className="space-y-6">
              
              {requestApprobation.length === 0 ? (<Card >
                <CardHeader>
                  <CardTitle>En attente d'approbation</CardTitle>
                  <CardDescription>
                    Demandes nécessitant une action
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    Aucune demande en attente d'approbation.
                  </p>
                </CardContent>
              </Card>) : 
              (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filtres
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Statut" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="in_progress">En cours</SelectItem>
                            <SelectItem value="approuved">Approuvé</SelectItem>
                            <SelectItem value="rejected">Rejeté</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Priorité" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Toutes les priorités</SelectItem>
                            <SelectItem value="high">Haute</SelectItem>
                            <SelectItem value="medium">Moyenne</SelectItem>
                            <SelectItem value="low">Faible</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={() => {
                          setSearchTerm("")
                          setStatusFilter("all")
                          setPriorityFilter("all")
                        }}>
                          Réinitialiser filtres
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contrôles de pagination et sélection du nombre d'éléments */}
                  {filteredApprobation.length > 0 && (
                    <div className="flex justify-between items-center">
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
                        Affichage de {startIndex + 1} à {Math.min(endIndex, filteredApprobation.length)} sur {filteredApprobation.length} demande{filteredApprobation.length > 1 ? 's' : ''}
                      </div>
                    </div>
                  )}

                  {/* Requests list */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Demandes ({filteredApprobation.length})</CardTitle>
                      <CardDescription>
                        Liste des demandes de bypass
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {activeTab === "pending" && paginatedList.map((request) => (
                          <div 
                            key={request.id} 
                            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                                {getStatusIcon(request.status)}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{request.request_code}</span>
                                  <Badge variant="outline" className={getPriorityColor(request.priority)}>
                                    {request.priority}
                                  </Badge>
                                  <Badge className={getStatusColor(request.status)}>
                                    {request.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{request.equipment.name}</p>
                                <p className="text-xs text-muted-foreground">{request.sensor.name}</p>
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="text-sm font-medium">{request.requester.full_name}</p>
                              <p className="text-xs text-muted-foreground">
                              {new Date(request.created_at).toLocaleString("fr-FR", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                              </p>
                              
                              <p className="text-xs text-muted-foreground">{request.description}</p>
                            </div>
                            <RequestDetailsModal request={request} />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pagination */}
                  {filteredApprobation.length > 0 && totalPages > 1 && (
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
                </>
              )}
            </TabsContent>

            <TabsContent value="active" className="space-y-6">
            {requestActifs.length === 0 ? (<Card >
                <CardHeader>
                  <CardTitle>Bypass actifs</CardTitle>
                  <CardDescription>
                    Demandes de bypass actuellement actives
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    Aucun bypass actif.
                  </p>
                </CardContent>
              </Card>) : 
              (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filtres
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Statut" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="in_progress">En cours</SelectItem>
                            <SelectItem value="approuved">Approuvé</SelectItem>
                            <SelectItem value="rejected">Rejeté</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Priorité" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Toutes les priorités</SelectItem>
                            <SelectItem value="high">Haute</SelectItem>
                            <SelectItem value="medium">Moyenne</SelectItem>
                            <SelectItem value="low">Faible</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={() => {
                          setSearchTerm("")
                          setStatusFilter("all")
                          setPriorityFilter("all")
                        }}>
                          Réinitialiser filtres
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contrôles de pagination et sélection du nombre d'éléments */}
                  {filteredActifs.length > 0 && (
                    <div className="flex justify-between items-center">
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
                        Affichage de {startIndex + 1} à {Math.min(endIndex, filteredActifs.length)} sur {filteredActifs.length} demande{filteredActifs.length > 1 ? 's' : ''}
                      </div>
                    </div>
                  )}

                  {/* Requests list */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Demandes ({filteredActifs.length})</CardTitle>
                      <CardDescription>
                        Liste des demandes de bypass
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {activeTab === "active" && paginatedList.map((request) => (
                          <div 
                            key={request.id} 
                            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                                {getStatusIcon(request.status)}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{request.request_code}</span>
                                  <Badge variant="outline" className={getPriorityColor(request.priority)}>
                                    {request.priority}
                                  </Badge>
                                  <Badge className={getStatusColor(request.status)}>
                                    {request.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{request.equipment.name}</p>
                                <p className="text-xs text-muted-foreground">{request.sensor.name}</p>
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="text-sm font-medium">{request.requester.full_name}</p>
                              <p className="text-xs text-muted-foreground">
                              {new Date(request.created_at).toLocaleString("fr-FR", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                              </p>
                              
                              <p className="text-xs text-muted-foreground">{request.description}</p>
                            </div>
                            <RequestDetailsModal request={request} />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pagination */}
                  {filteredActifs.length > 0 && totalPages > 1 && (
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
                </>
              )}
            </TabsContent>
          </>
        )}
        
      </Tabs>
    </div>
  )
}