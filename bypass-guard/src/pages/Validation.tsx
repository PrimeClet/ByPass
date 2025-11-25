import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Settings,
  FileText,
  CheckSquare,
  ArrowLeft
} from "lucide-react"

import { useLocation, Link } from "react-router-dom"
import api from '../axios'
import { useState, useEffect } from "react"
import { set, string } from "zod"
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom"


const pendingRequests = [
  {
    id: "BR-2024-001",
    equipment: "Ligne de production A",
    sensor: "Capteur de pression #12",
    requester: "Marie Martin",
    requestDate: "2024-01-15",
    priority: "Haute",
    reason: "Maintenance préventive urgente",
    plannedStart: "2024-01-16 08:00",
    plannedEnd: "2024-01-16 12:00",
    riskLevel: "Moyen",
    description: "Bypass nécessaire pour effectuer la maintenance préventive du capteur de pression. L'équipement restera opérationnel avec surveillance manuelle.",
    validationLevel: 1,
    nextValidators: ["Superviseur technique", "Manager sécurité"]
  },
  {
    id: "BR-2024-005",
    equipment: "Four industriel B",
    sensor: "Capteur de température #8",
    requester: "Pierre Dubois",
    requestDate: "2024-01-15",
    priority: "Moyenne",
    reason: "Étalonnage capteur",
    plannedStart: "2024-01-17 14:00",
    plannedEnd: "2024-01-17 16:00",
    riskLevel: "Faible",
    description: "Étalonnage périodique du capteur de température. Bypass de 2h avec surveillance continue.",
    validationLevel: 1,
    nextValidators: ["Manager production"]
  }
]

export default function Validation() {

  const location = useLocation()
  const [requestApprobation, setRequestApprobationList] = useState([]);
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [isLoading, setIsLoading] = useState(true);

  const setRejectionReason = (requestId: string, reason: string) => {
    setRejectionReasons(prev => ({ ...prev, [requestId]: reason }));
  };

  const getRejectionReason = (requestId: string) => {
    return rejectionReasons[requestId] || '';
  };

  const reasonLabels: Record<BypassReason, string> = {
      preventive_maintenance: 'Maintenance préventive',
      corrective_maintenance: 'Maintenance corrective',
      calibration: 'Étalonnage',
      testing: 'Tests',
      emergency_repair: 'Réparation d\'urgence',
      system_upgrade: 'Mise à niveau système',
      investigation: 'Investigation',
      other: 'Autre'
    };
  
  function getMaintenanceLabel(key: string): string {
    return reasonLabels[key] ?? key; // si pas trouvé, on retourne la clé brute
  }

  const acceptedRequest = (id: string, data : any, reason: string = '') => {
    // Simulate API call
    try {
      const rejectionReason = reason || data.rejection_reason || '';
      if(rejectionReason === ''){
        toast.error("Veuillez entrer un motif, au cas contraire - RAS");
      } else {
        api({
          method: 'put',
          url: `/requests/${id}/validate`,
          data: { ...data, rejection_reason: rejectionReason }
        })
        .then(data => {
          if (data) {
            toast.success("Demande de Bypass Soumis avec Succes");
            setRejectionReason(id, '');
            navigate('/requests/mine')
          } else {
            toast.error("Probleme de connexion");
          }
        })
        setRejectionReason(id, '');
      }
     
   } catch (error) {
     console.error('Erreur lors de la soumission:', error);
   }
 }



  type validateData = "validation_status" | "rejection_reason";

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


  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Élevé": return "bg-destructive text-destructive-foreground"
      case "high": return "bg-destructive text-destructive-foreground"
      case "Moyen": return "bg-warning text-warning-foreground"
      case "medium": return "bg-warning text-warning-foreground"
      case "Faible": return "bg-success text-success-foreground"
      case "low": return "bg-success text-success-foreground"
      default: return "bg-muted text-muted-foreground"
    }
  }

  useEffect(() => {
    setIsLoading(true);
    api.get('/requests/pending')
    .then(response => {
      // Handle successful response
      // console.log(response.data); // The fetched data is typically in response.data
      setRequestApprobationList(response.data.data);
      setIsLoading(false);
    })
    .catch(error => {
      // Handle error
      console.error('Error fetching data:', error);
      setIsLoading(false);
    });
    

  }, [location.key])

  // Calcul de la pagination
  const totalPages = Math.ceil(requestApprobation.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = requestApprobation.slice(startIndex, endIndex);

  // Réinitialiser la page quand le nombre d'éléments par page change
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  return (
    <div className="w-full p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 overflow-x-hidden box-border">
      {/* Header avec breadcrumb */}
      <Card className="bg-card rounded-lg border">
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between gap-2 sm:gap-4 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
              {/* Icône */}
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-600 flex items-center justify-center">
                <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              {/* Titre, description et breadcrumb */}
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground break-words mb-1 truncate">Centre de validation</h1>
                <p className="text-xs sm:text-sm text-muted-foreground break-words mb-2 line-clamp-1">Validation hiérarchique des demandes de bypass</p>
                <Breadcrumb>
                  <BreadcrumbList className="flex-wrap">
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link to="/" className="truncate">Tableau de bord</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="truncate">Validation</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>
            {/* Bouton retour et badge */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <Badge variant="outline" className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                <span className="truncate">{requestApprobation.length} en attente</span>
              </Badge>
              <Button variant="outline" size="icon" className="flex-shrink-0 rounded-full w-9 h-9 sm:w-10 sm:h-10" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contrôles de pagination et sélection du nombre d'éléments */}
      {!isLoading && requestApprobation.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 mt-3 sm:mt-4 w-full min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Label htmlFor="items-per-page" className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0">Éléments par page:</Label>
            <Select 
              value={itemsPerPage.toString()} 
              onValueChange={(value) => setItemsPerPage(Number(value))}
            >
              <SelectTrigger className="w-16 sm:w-20 flex-shrink-0 h-8 text-xs sm:text-sm">
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
          <div className="text-xs text-muted-foreground text-left truncate whitespace-nowrap">
            Affichage de {startIndex + 1} à {Math.min(endIndex, requestApprobation.length)} sur {requestApprobation.length} demande{requestApprobation.length > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Pending requests - Grille mobile / Liste desktop */}
      {isLoading ? (
        <>
          {/* Skeleton Loading - Vue grille mobile/tablette */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-3 sm:gap-3 md:gap-4 w-full min-w-0">
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <Card key={index} className="flex flex-col h-full w-full min-w-0 box-border">
                <CardHeader className="pb-4 p-6 min-w-0">
                  <div className="flex items-start justify-between gap-1.5 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <Skeleton className="w-6 h-6 rounded" />
                      <div className="min-w-0 flex-1">
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-1.5 p-6 pt-0 min-w-0">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-8 w-full mt-3" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Skeleton Loading - Vue liste desktop */}
          <div className="hidden lg:block space-y-3 sm:space-y-4 md:space-y-6 w-full min-w-0">
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <Card key={index} className="w-full box-border">
                <CardHeader className="bg-muted/50 p-3 sm:p-4 md:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 min-w-0">
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
                  <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full min-w-0">
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                  </div>
                  <Skeleton className="h-24 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : requestApprobation.length === 0 ? (
        <Card className="w-full box-border">
          <CardContent className="text-center py-6 sm:py-8">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-success mx-auto mb-4" />
            <h3 className="text-sm sm:text-base font-semibold mb-2">Aucune demande en attente</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Toutes les demandes ont été traitées.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Vue grille pour mobile/tablette - cachée sur desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-3 sm:gap-3 md:gap-4 w-full min-w-0">
            {paginatedRequests.map((request) => (
            <Card key={request.request_code} className="hover:shadow-lg transition-shadow flex flex-col h-full w-full min-w-0 box-border">
              <CardHeader className="pb-4 p-6 min-w-0">
                <div className="flex items-start justify-between gap-1.5 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg truncate min-w-0">{request.request_code}</CardTitle>
                      <CardDescription className="text-xs line-clamp-2 mt-1.5 min-w-0">
                        {request.equipment?.name || 'N/A'} - {request.sensor?.name || 'N/A'}
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  <Badge variant="outline" className={getPriorityColor(request.priority) + " text-xs whitespace-nowrap flex-shrink-0"}>
                    {request.priority}
                  </Badge>
                  <Badge variant="outline" className={getRiskColor(request.impact_securite) + " text-xs whitespace-nowrap flex-shrink-0"}>
                    Risque {request.impact_securite}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5 p-6 pt-0 min-w-0">
                <div className="flex items-center justify-between min-w-0">
                  <span className="text-xs text-muted-foreground truncate">Demandeur:</span>
                  <span className="text-xs truncate">{request.requester?.full_name || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between min-w-0">
                  <span className="text-xs text-muted-foreground truncate">Date:</span>
                  <span className="text-xs truncate whitespace-nowrap">
                    {new Date(request.created_at).toLocaleString("fr-FR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-3 text-xs"
                  onClick={() => {
                    setSelectedRequest(request);
                    setIsDialogOpen(true);
                  }}
                >
                  Voir les détails
                </Button>
              </CardContent>
            </Card>
            ))}
          </div>

          {/* Vue liste détaillée pour desktop - visible seulement sur lg et plus */}
          <div className="hidden lg:block space-y-3 sm:space-y-4 md:space-y-6 w-full min-w-0">
            {paginatedRequests.map((request) => (
              <Card key={request.request_code} className="overflow-hidden w-full box-border">
                <CardHeader className="bg-muted/50 p-3 sm:p-4 md:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 min-w-0">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg">
                        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-warning shrink-0" />
                        <span className="truncate">{request.request_code}</span>
                      </CardTitle>
                      <CardDescription className="mt-1 text-[10px] sm:text-xs md:text-sm truncate">
                        {request.equipment?.name || 'N/A'} - {request.sensor?.name || 'N/A'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                      <Badge variant="outline" className={getPriorityColor(request.priority) + " text-[10px] sm:text-xs whitespace-nowrap flex-shrink-0"}>
                        {request.priority}
                      </Badge>
                      <Badge variant="outline" className={getRiskColor(request.impact_securite) + " text-[10px] sm:text-xs whitespace-nowrap flex-shrink-0"}>
                        Risque {request.impact_securite}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
                  {/* Request details */}
                  <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full min-w-0">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Demandeur
                      </Label>
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-[10px] sm:text-xs md:text-sm truncate">{request.requester?.full_name || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Date de demande
                      </Label>
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-[10px] sm:text-xs md:text-sm truncate whitespace-nowrap">
                        {new Date(request.created_at).toLocaleString("fr-FR", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Raison
                      </Label>
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <Settings className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-[10px] sm:text-xs md:text-sm truncate">{ getMaintenanceLabel(request.title) }</span>
                      </div>
                    </div>
                  </div>

                  {/* Planning */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Planification
                    </Label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 md:gap-4 text-[10px] sm:text-xs md:text-sm min-w-0">
                      <span className="truncate whitespace-nowrap min-w-0">Début: 
                      {new Date(request.start_time).toLocaleString("fr-FR", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                      </span>
                      <span className="truncate whitespace-nowrap min-w-0">Fin: <strong>
                      {new Date(request.end_time).toLocaleString("fr-FR", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                        </strong></span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 sm:space-y-2 min-w-0">
                    <Label className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Description détaillée
                    </Label>
                    <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground break-words min-w-0 overflow-wrap-anywhere">
                      {request.description}
                    </p>
                  </div>

                  {/* Comments */}
                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor={`comment-${request.request_code}`} className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Commentaires de validation
                    </Label>
                    <Textarea
                      id={`comment-${request.request_code}`}
                      className="min-h-[70px] sm:min-h-[80px] md:min-h-[100px] text-xs sm:text-sm w-full min-w-0"
                      placeholder="Expliquez la raison du rejet... Ecrire (RAS) au cas contraire"
                      value={getRejectionReason(request.id)}
                      onChange={(e) => setRejectionReason(request.id, e.target.value)}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-2 sm:pt-3 md:pt-4 border-t min-w-0">
                    <Button variant="outline" className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10 min-w-0 flex-shrink-0"
                      onClick={() => {
                        acceptedRequest(request.id, { 
                          validation_status: "rejected"
                        }, getRejectionReason(request.id))
                      }}
                    >
                      <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">Rejeter</span>
                    </Button>
                    <Button variant="success" className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10 min-w-0 flex-shrink-0"
                      onClick={() => {
                        acceptedRequest(request.id, { 
                          validation_status: "approved"
                        }, getRejectionReason(request.id))
                      }}
                    >
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">Approuver</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Dialog pour les détails et validation */}
      {selectedRequest && (
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false);
            setSelectedRequest(null);
          }
        }}>
          <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">
                Détails de la demande {selectedRequest.request_code}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Validation hiérarchique des demandes de bypass
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {/* Request details */}
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full min-w-0">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Demandeur
                  </Label>
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">{selectedRequest.requester?.full_name || 'N/A'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date de demande
                  </Label>
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate whitespace-nowrap">
                    {new Date(selectedRequest.created_at).toLocaleString("fr-FR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Raison
                  </Label>
                  <div className="flex items-center gap-2 min-w-0">
                    <Settings className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">{ getMaintenanceLabel(selectedRequest.title) }</span>
                  </div>
                </div>
              </div>

              {/* Planning */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Planification
                </Label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm min-w-0">
                  <span className="truncate whitespace-nowrap min-w-0">Début: 
                  {new Date(selectedRequest.start_time).toLocaleString("fr-FR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                  </span>
                  <span className="truncate whitespace-nowrap min-w-0">Fin: <strong>
                  {new Date(selectedRequest.end_time).toLocaleString("fr-FR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                    </strong></span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 min-w-0">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Description détaillée
                </Label>
                <p className="text-sm text-muted-foreground break-words min-w-0">
                  {selectedRequest.description}
                </p>
              </div>

              {/* Comments */}
              <div className="space-y-3">
                <Label htmlFor="comment-dialog" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Commentaires de validation
                </Label>
                <Textarea
                  id="comment-dialog"
                  className="min-h-[100px] text-sm w-full min-w-0"
                  placeholder="Expliquez la raison du rejet... Ecrire (RAS) au cas contraire"
                  value={getRejectionReason(selectedRequest.id)}
                  onChange={(e) => setRejectionReason(selectedRequest.id, e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 w-full sm:w-auto text-sm"
                onClick={() => {
                  setIsDialogOpen(false);
                  setSelectedRequest(null);
                }}
              >
                Annuler
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 w-full sm:w-auto text-sm"
                onClick={() => {
                  acceptedRequest(selectedRequest.id, { 
                    validation_status: "rejected"
                  }, getRejectionReason(selectedRequest.id));
                  setIsDialogOpen(false);
                  setSelectedRequest(null);
                }}
              >
                <XCircle className="w-4 h-4" />
                Rejeter
              </Button>
              <Button 
                variant="success" 
                className="flex items-center gap-2 w-full sm:w-auto text-sm"
                onClick={() => {
                  acceptedRequest(selectedRequest.id, { 
                    validation_status: "approved"
                  }, getRejectionReason(selectedRequest.id));
                  setIsDialogOpen(false);
                  setSelectedRequest(null);
                }}
              >
                <CheckCircle className="w-4 h-4" />
                Approuver
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Pagination */}
      {requestApprobation.length > 0 && totalPages > 1 && (
        <div className="flex justify-center sm:justify-end items-center mt-4 sm:mt-6 w-full min-w-0 overflow-x-hidden">
          <Pagination>
            <PaginationContent className="flex-wrap min-w-0">
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