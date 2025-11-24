import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Settings,
  FileText
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
  const [rejectionReason, setRejectionReason] = useState("")
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);

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

  const acceptedRequest = (id: string, data : any) => {
    // Simulate API call
    try {
      if(data.rejection_reason === ''){
        toast.error("Veuillez entrer un motif, au cas contraire - RAS");
      } else {
        api({
          method: 'put',
          url: `/requests/${id}/validate`,
          data: data
        })
        .then(data => {
          if (data) {
            toast.success("Demande de Bypass Soumis avec Succes");
            setRejectionReason('')
            navigate('/requests/mine')
          } else {
            toast.error("Probleme de connexion");
          }
        })
        setRejectionReason('')
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
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 overflow-x-hidden box-border">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 min-w-0 box-border">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground break-words">Centre de validation</h1>
          <p className="text-xs sm:text-sm text-muted-foreground break-words">
            Validation hiérarchique des demandes de bypass
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="outline" className="flex items-center gap-2 text-xs sm:text-sm">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {requestApprobation.length} en attente
          </Badge>
        </div>
      </div>

      {/* Contrôles de pagination et sélection du nombre d'éléments */}
      {requestApprobation.length > 0 && (
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
          <div className="text-xs text-muted-foreground text-center sm:text-right">
            Affichage de {startIndex + 1} à {Math.min(endIndex, requestApprobation.length)} sur {requestApprobation.length} demande{requestApprobation.length > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Pending requests */}
      <div className="space-y-4 sm:space-y-6">
        {paginatedRequests.map((request) => (
          <Card key={request.request_code} className="overflow-hidden w-full box-border">
            <CardHeader className="bg-muted/50 p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
                <div className="flex-1 min-w-0">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-warning shrink-0" />
                    <span className="truncate">{request.request_code}</span>
                  </CardTitle>
                  <CardDescription className="mt-1 text-xs sm:text-sm truncate">
                    {request.equipment.name} - {request.sensor.name}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={getPriorityColor(request.priority) + " text-xs"}>
                    {request.priority}
                  </Badge>
                  <Badge variant="outline" className={getRiskColor(request.impact_securite) + " text-xs"}>
                    Risque {request.impact_securite}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
              {/* Request details */}
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Demandeur
                  </Label>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm truncate">{request.requester.full_name}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date de demande
                  </Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm">
                    {new Date(request.created_at).toLocaleString("fr-FR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Raison
                  </Label>
                  <div className="flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm truncate">{ getMaintenanceLabel(request.title) }</span>
                  </div>
                </div>
              </div>

              {/* Planning */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Planification
                </Label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                  <span>Début: 
                  {new Date(request.start_time).toLocaleString("fr-FR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                  </span>
                  <span>Fin: <strong>
                  {new Date(request.end_time).toLocaleString("fr-FR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                    </strong></span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Description détaillée
                </Label>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {request.description}
                </p>
              </div>

              {/* Validation flow */}
              {/* <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Circuit de validation
                </Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary text-primary-foreground">
                    Niveau {request.validationLevel}
                  </Badge>
                  <span className="text-sm text-muted-foreground">→</span>
                  <span className="text-sm">{request.nextValidators.join(", ")}</span>
                </div>
              </div> */}

              {/* Comments */}
              <div className="space-y-3">
                <Label htmlFor={`comment-${request.request_code}`} className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Commentaires de validation
                </Label>
                <Textarea
                  id={`comment-${request.request_code}`}
                  className="min-h-[80px] sm:min-h-[100px] text-sm"
                  placeholder="Expliquez la raison du rejet... Ecrire (RAS) au cas contraire"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
                <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto text-sm"
                  onClick={() => {
                    acceptedRequest(request.id, { 
                      validation_status: "rejected", 
                      rejection_reason: rejectionReason 
                    })
                  }}
                >
                  <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Rejeter
                </Button>
                <Button variant="success" className="flex items-center gap-2 w-full sm:w-auto text-sm"
                  onClick={() => {
                    acceptedRequest(request.id, { 
                      validation_status: "approved", 
                      rejection_reason: rejectionReason 
                    })
                  }}
                >
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Approuver
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {requestApprobation.length === 0 && (
        <Card className="w-full box-border">
          <CardContent className="text-center py-6 sm:py-12 p-3 sm:p-6">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-success mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-2">Aucune demande en attente</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Toutes les demandes ont été traitées.
            </p>
          </CardContent>
        </Card>
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