import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users,
  FileText,
  Activity,
  TrendingUp,
  Shield
} from "lucide-react"
import { cva } from "class-variance-authority";
import { useState, useEffect } from 'react';
import api from '../axios'
import { useLocation, Link } from "react-router-dom"


export default function Dashboard() {

  const [das, setdas] = useState(0)
  const [eav, seteav] = useState(0)
  const [aad, setaad] = useState(0)
  const [ucs, setucs] = useState(0)
  const [monitoring, setMonitoring] = useState(0)
  const [online, setOnline] = useState(0)
  const [active, setActive] = useState(0)
  const [systeme, setSysteme] = useState(0)
  const [requestList, setRequestList] = useState([]);


  useEffect(() => {
    api.get('/dashboard/summary')
    .then(response => {
        setaad(response.data.approved_today)
        setdas(response.data.active_requests)
        seteav(response.data.pending_validation)
        setucs(response.data.connected_users)
    })
    .catch(error => {
      // Handle error
      console.error('Error fetching data:', error);
    });
  
    //recents-requets
  
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
  
    //systems-status
    api.get('/dashboard/system-status')
    .then(response => {
      // Handle successful response
      console.log(response.data); // The fetched data is typically in response.data
      setMonitoring(response.data.monitored_equipment)
      setOnline(response.data.online_sensors)
      setActive(response.data.active_alerts)
      setSysteme(response.data.system_performance)
        
    })
    .catch(error => {
      // Handle error
      console.error('Error fetching data:', error);
    });
  
  }, [])

  


  const stats = [
    {
      title: "Demandes actives",
      value: das,
      description: "En cours de traitement",
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    {
      title: "En attente validation",
      value: eav,
      description: "Nécessitent votre attention",
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10"
    },
    {
      title: "Approuvées aujourd'hui",
      value: aad,
      description: "Validations effectuées",
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      title: "Utilisateurs connectés",
      value: ucs,
      description: "Actuellement en ligne",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10"
    }
  ]


  const recentRequests = [
    {
      id: "BR-2024-001",
      equipment: "Ligne de production A",
      sensor: "Capteur de pression #12",
      requester: "Marie Martin",
      priority: "Haute",
      status: "En attente"
    },
    {
      id: "BR-2024-002", 
      equipment: "Four industriel B",
      sensor: "Capteur de température #8",
      requester: "Pierre Dubois",
      priority: "Moyenne",
      status: "Approuvé"
    },
    {
      id: "BR-2024-003",
      equipment: "Compresseur C",
      sensor: "Capteur de vibration #3",
      requester: "Sophie Leroy",
      priority: "Faible",
      status: "En cours"
    }
  ]

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

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble du système Bypass Guard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link to="/requests/new">
              <FileText className="w-4 h-4 mr-2" />
              Nouvelle demande
            </Link>
            
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Demandes récentes
            </CardTitle>
            <CardDescription>
              Les dernières demandes de bypass soumises
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {requestList?.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{request.request_code}</span>
                    <Badge variant="outline" className={getPriorityColor(request.priority)}>
                      {request.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{request.equipment.name}</p>
                  <p className="text-xs text-muted-foreground">{request.sensor.name}</p>
                </div>
                <div className="text-right space-y-1">
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{request.requester.full_name}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              État du système
            </CardTitle>
            <CardDescription>
              Surveillance en temps réel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Équipements surveillés</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success"></div>
                  <span className="text-sm font-medium">{monitoring} actifs</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Capteurs en ligne</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success"></div>
                  <span className="text-sm font-medium">{online} connectés</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Alertes actives</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-warning"></div>
                  <span className="text-sm font-medium">{active} en cours</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Performance système</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium">{systeme}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}