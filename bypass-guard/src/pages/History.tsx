import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
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
  ArrowLeft,
  LayoutGrid,
  Table as TableIcon
} from "lucide-react"
import { useLocation, Link } from "react-router-dom"
import api from '../axios'
import { useIsMobile } from "@/hooks/use-mobile"


export default function History() {

  const location = useLocation()
  const isMobile = useIsMobile()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [requestList, setRequestList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(isMobile ? 'grid' : 'grid');
  const [isLoading, setIsLoading] = useState(true);

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
    setIsLoading(true);
    api.get('/dashboard/recent-requests')
    .then(response => {
      // Handle successful response
      console.log(response.data); // The fetched data is typically in response.data
      setRequestList(response.data);
      setIsLoading(false);
    })
    .catch(error => {
      // Handle error
      console.error('Error fetching data:', error);
      setIsLoading(false);
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
    <div className="w-full p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 overflow-x-hidden box-border">
      {/* Header avec breadcrumb */}
      <Card className="bg-card rounded-lg border">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Icône */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                <HistoryIcon className="w-6 h-6 text-white" />
              </div>
              {/* Titre, description et breadcrumb */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground break-words mb-1">Historique des demandes</h1>
                <p className="text-xs sm:text-sm text-muted-foreground break-words mb-2">Journal d'audit et historique des validations</p>
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link to="/">Tableau de bord</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Historique</BreadcrumbPage>
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

      {/* Bouton exporter */}
      <div className="flex justify-end">
        <Button variant="outline" size={isMobile ? "sm" : "default"} className="gap-2">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Exporter</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
          {/* <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            Filtres de recherche
          </CardTitle>
        </CardHeader> */}
        <CardContent className="p-4 sm:p-6">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full text-sm sm:text-base"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full text-sm sm:text-base">
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
              <SelectTrigger className="w-full text-sm sm:text-base">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les périodes</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={()=>{
              setSearchTerm("")
              setStatusFilter("all")
              setDateFilter("all")
              }} 
              className="w-full sm:w-auto text-sm sm:text-base"
              size={isMobile ? "sm" : "default"}
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contrôles de pagination et sélection du nombre d'éléments */}
      {!isLoading && filteredHistory.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Label htmlFor="items-per-page" className="text-xs sm:text-sm whitespace-nowrap">Éléments par page:</Label>
              <Select 
                value={itemsPerPage.toString()} 
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger className="w-16 sm:w-20 md:w-24 text-sm">
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
            {!isMobile && (
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
            )}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground text-left sm:text-right w-full sm:w-auto">
            Affichage de {startIndex + 1} à {Math.min(endIndex, filteredHistory.length)} sur {filteredHistory.length} demande{filteredHistory.length > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* History list */}
      {isLoading ? (
        <>
          {/* Skeleton Loading - Vue grille */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3 md:gap-4 w-full min-w-0 ${viewMode === 'table' ? 'lg:hidden' : ''}`}>
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <Card key={index} className="flex flex-col h-full w-full min-w-0 box-border">
                <CardHeader className="pb-4 p-6 min-w-0">
                  <div className="flex items-start justify-between gap-1.5 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="min-w-0 flex-1">
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent className="space-y-2 p-6 pt-0 min-w-0">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Skeleton Loading - Vue tableau */}
          {viewMode === 'table' && (
            <Card className="w-full min-w-0 box-border hidden lg:block">
              <CardHeader className="p-3 sm:p-4">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="p-0 sm:p-3 w-full min-w-0 overflow-hidden">
                <div className="w-full min-w-0">
                  <Table className="w-full min-w-[700px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Code</TableHead>
                        <TableHead className="text-xs sm:text-sm">Équipement</TableHead>
                        <TableHead className="text-xs sm:text-sm">Capteur</TableHead>
                        <TableHead className="text-xs sm:text-sm">Demandeur</TableHead>
                        <TableHead className="text-xs sm:text-sm">Date</TableHead>
                        <TableHead className="text-xs sm:text-sm">Statut</TableHead>
                        <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: itemsPerPage }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell>
                            <Skeleton className="h-8 w-8" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : viewMode === 'grid' ? (
        <>
          {/* Vue grille - toujours visible sur mobile, cachée sur desktop si viewMode est 'table' */}
          {!isLoading && paginatedHistory.length === 0 ? (
            <Card>
              <CardContent className="p-6 sm:p-12 text-center">
                <HistoryIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {requestList.length === 0 ? 'Aucune demande' : 'Aucun résultat'}
                </h3>
                <p className="text-muted-foreground">
                  {requestList.length === 0 
                    ? 'Aucune demande dans l\'historique.'
                    : 'Aucune demande ne correspond à vos critères de recherche.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3 md:gap-4 w-full min-w-0">
              {paginatedHistory.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow flex flex-col h-full w-full min-w-0 box-border">
                  <CardHeader className="pb-4 p-6 min-w-0">
                    <div className="flex items-start justify-between gap-1.5 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 flex-shrink-0">
                          {getStatusIcon(item.status)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-lg truncate min-w-0">{item.request_code}</CardTitle>
                          <Badge className={`${getStatusColor(item.status)} mt-1`}>
                            <span className="text-xs">{item.status}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-xs line-clamp-2 mt-1.5">
                      {item.equipment.name} - {item.sensor.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 p-6 pt-0 min-w-0">
                    <div className="flex items-center justify-between min-w-0">
                      <span className="text-xs text-muted-foreground truncate">Demandeur:</span>
                      <span className="text-xs truncate ml-2">{item.requester.full_name}</span>
                    </div>
                    <div className="flex items-center justify-between min-w-0">
                      <span className="text-xs text-muted-foreground truncate">Validateur:</span>
                      <span className="text-xs truncate ml-2">{item.validator?.full_name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between min-w-0">
                      <span className="text-xs text-muted-foreground truncate">Durée:</span>
                      <span className="text-xs truncate ml-2">{Math.round(diffInHours(item.end_time, item.start_time))}h</span>
                    </div>
                    <div className="flex items-center justify-between min-w-0">
                      <span className="text-xs text-muted-foreground truncate">Date:</span>
                      <span className="text-xs truncate ml-2">
                        {new Date(item.created_at).toLocaleDateString("fr-FR", {
                          dateStyle: isMobile ? "short" : "medium"
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Vue tableau - visible seulement sur desktop quand viewMode est 'table' */}
          {viewMode === 'table' && (
        <Card className="w-full min-w-0 box-border hidden lg:block">
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="text-sm sm:text-base">Historique ({filteredHistory.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                      <TableHead className="min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm">Code</TableHead>
                      <TableHead className="min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm hidden sm:table-cell">Équipement</TableHead>
                      <TableHead className="min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm hidden md:table-cell">Capteur</TableHead>
                      <TableHead className="min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm hidden lg:table-cell">Demandeur</TableHead>
                      <TableHead className="min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm">Statut</TableHead>
                      <TableHead className="min-w-[110px] sm:min-w-[140px] text-xs sm:text-sm">Date demande</TableHead>
                      <TableHead className="min-w-[110px] sm:min-w-[140px] text-xs sm:text-sm hidden md:table-cell">Date validation</TableHead>
                      <TableHead className="min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm hidden lg:table-cell">Validateur</TableHead>
                      <TableHead className="min-w-[60px] sm:min-w-[80px] text-xs sm:text-sm">Durée</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <HistoryIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-base sm:text-lg font-semibold mb-2">
                          {requestList.length === 0 ? 'Aucune demande' : 'Aucun résultat'}
                        </h3>
                          <p className="text-sm sm:text-base text-muted-foreground">
                          {requestList.length === 0 
                            ? 'Aucune demande dans l\'historique.'
                            : 'Aucune demande ne correspond à vos critères de recherche.'
                          }
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedHistory.map((item) => (
                      <TableRow key={item.id}>
                          <TableCell className="font-medium text-xs sm:text-sm">
                          {item.request_code}
                        </TableCell>
                          <TableCell className="break-words text-xs sm:text-sm hidden sm:table-cell">{item.equipment.name}</TableCell>
                          <TableCell className="break-words text-xs sm:text-sm hidden md:table-cell">{item.sensor.name}</TableCell>
                          <TableCell className="break-words text-xs sm:text-sm hidden lg:table-cell">{item.requester.full_name}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(item.status)}>
                              <span className="text-xs">{item.status}</span>
                          </Badge>
                        </TableCell>
                          <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                          {new Date(item.created_at).toLocaleString("fr-FR", {
                              dateStyle: isMobile ? "short" : "medium",
                            timeStyle: "short",
                          })}
                        </TableCell>
                          <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">
                          {new Date(item.validated_at).toLocaleString("fr-FR", {
                              dateStyle: isMobile ? "short" : "medium",
                            timeStyle: "short",
                          })}
                        </TableCell>
                          <TableCell className="break-words text-xs sm:text-sm hidden lg:table-cell">{item.validator?.full_name || 'N/A'}</TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            {Math.round(diffInHours(item.end_time, item.start_time))}h
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
            </div>
          </CardContent>
        </Card>
          )}
        </>
      )}

      {/* Pagination */}
      {filteredHistory.length > 0 && totalPages > 1 && (
        <div className="flex justify-center sm:justify-end items-center mt-4 sm:mt-6 w-full">
          <Pagination>
            <PaginationContent className="flex-wrap gap-1 sm:gap-2">
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
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Sur mobile, afficher seulement la page actuelle et les pages adjacentes
                  if (isMobile) {
                    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                  }
                  return true;
                })
                .map((page, index, array) => {
                  // Ajouter des ellipses sur mobile si nécessaire
                  if (isMobile && index > 0 && page - array[index - 1] > 1) {
                    return (
                      <React.Fragment key={`ellipsis-${page}`}>
                        <PaginationItem>
                          <span className="px-2 text-muted-foreground">...</span>
                        </PaginationItem>
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                            isActive={currentPage === page}
                            className="cursor-pointer text-xs sm:text-sm"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      </React.Fragment>
                    );
                  }
                  return (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page);
                    }}
                    isActive={currentPage === page}
                        className="cursor-pointer text-xs sm:text-sm min-w-[2rem] sm:min-w-[2.5rem]"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
                  );
                })}
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
}