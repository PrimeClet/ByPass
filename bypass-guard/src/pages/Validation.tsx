import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centre de validation</h1>
          <p className="text-muted-foreground">
            Validation hiérarchique des demandes de bypass
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {requestApprobation.length} en attente
          </Badge>
        </div>
      </div>

      {/* Pending requests */}
      <div className="space-y-6">
        {requestApprobation.map((request) => (
          <Card key={request.request_code} className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    {request.request_code}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {request.equipment.name} - {request.sensor.name}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getPriorityColor(request.priority)}>
                    {request.priority}
                  </Badge>
                  <Badge variant="outline" className={getRiskColor(request.impact_securite)}>
                    Risque {request.impact_securite}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Request details */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Demandeur
                  </Label>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{request.requester.full_name}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date de demande
                  </Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
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
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{ getMaintenanceLabel(request.title) }</span>
                  </div>
                </div>
              </div>

              {/* Planning */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Planification
                </Label>
                <div className="flex items-center gap-4 text-sm">
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
                <p className="text-sm text-muted-foreground">
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
                  className="min-h-[100px]"
                  placeholder="Expliquez la raison du rejet... Ecrire (RAS) au cas contraire"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button variant="outline" className="flex items-center gap-2"
                  onClick={() => {
                    acceptedRequest(request.id, { 
                      validation_status: "rejected", 
                      rejection_reason: rejectionReason 
                    })
                    // setRejectModalOpen(false)
                    // setOpen(false)
                  }}
                >
                  <XCircle className="w-4 h-4" />
                  Rejeter
                </Button>
                <Button variant="success" className="flex items-center gap-2"
                  onClick={() => {
                    acceptedRequest(request.id, { 
                      validation_status: "approved", 
                      rejection_reason: rejectionReason 
                    })
                    // setRejectModalOpen(false)
                    // setOpen(false)
                  }}
                >
                  <CheckCircle className="w-4 h-4" />
                  Approuver
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {requestApprobation.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune demande en attente</h3>
            <p className="text-muted-foreground">
              Toutes les demandes ont été traitées.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}