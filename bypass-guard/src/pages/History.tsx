import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { 
  History as HistoryIcon,
  Search,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Filter, 
  Plus,
  FileText,
  AlertTriangle,
  ArrowLeft
} from "lucide-react"
import { useLocation, Link } from "react-router-dom"
import api from '../axios'


export default function History() {

  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [requestList, setRequestList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  const filteredHistory = (requestList ?? []).filter(item => {
    const matchesSearch = item.equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.request_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.requester.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Calcul de la pagination
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedHistory = filteredHistory.slice(startIndex, endIndex);

  // Réinitialiser la page quand les filtres ou le nombre d'éléments par page changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter, itemsPerPage]);

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


  useEffect(() => {
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
    

  }, [location.key])

  const diffInHours = (date1: string | Date, date2: string | Date) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
  
    // difference in milliseconds
    const diffMs = d1.getTime() - d2.getTime();
  
    // convert ms → hours
    return diffMs / (1000 * 60 * 60);
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historique des demandes</h1>
          <p className="text-muted-foreground">
            Journal d'audit et historique des validations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Filtres de recherche
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
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les périodes</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={()=>{
              setSearchTerm("")
              setStatusFilter("all")
              setDateFilter("all")
            }}>
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contrôles de pagination et sélection du nombre d'éléments */}
      {filteredHistory.length > 0 && (
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
            Affichage de {startIndex + 1} à {Math.min(endIndex, filteredHistory.length)} sur {filteredHistory.length} demande{filteredHistory.length > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* History list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HistoryIcon className="w-5 h-5" />
            Historique ({filteredHistory.length})
          </CardTitle>
          <CardDescription>
            Toutes les demandes traitées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedHistory.map((item) => (
              <div 
                key={item.id} 
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      {getStatusIcon(item.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{item.request_code}</span>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.equipment.name}</p>
                      <p className="text-xs text-muted-foreground">{item.sensor.name}</p>
                    </div>
                  </div>
                  {/* <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Détails
                  </Button> */}
                </div>

                <div className="grid gap-3 md:grid-cols-3 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>Demandeur:</span>
                    </div>
                    <p>{item.requester.full_name}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Demande:</span>
                    </div>
                    <p>
                    {new Date(item.created_at).toLocaleString("fr-FR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="w-4 h-4" />
                      <span>Validation:</span>
                    </div>
                    <p>
                    {new Date(item.validated_at).toLocaleString("fr-FR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-muted-foreground">Validateur: </span>
                      <span className="font-medium">{item.validator?.full_name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Durée: </span>
                      <span className="font-medium">{diffInHours(item.end_time, item.start_time)} Heures</span>
                    </div>
                  </div>
                  {item.comments && (
                    <div className="mt-2">
                      <span className="text-muted-foreground text-xs">Commentaires: </span>
                      <p className="text-xs text-muted-foreground italic">{item.commentaires}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredHistory.length > 0 && totalPages > 1 && (
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
  )
}