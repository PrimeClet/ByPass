import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import echo from "../../utils/echo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Bell, ChevronDown, ExternalLink, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import api from "../../axios"

type BypassReason = 
  | 'preventive_maintenance'
  | 'corrective_maintenance'
  | 'calibration'
  | 'testing'
  | 'emergency_repair'
  | 'system_upgrade'
  | 'investigation'
  | 'other';

export default function Tinting({ userId, notification, onNotificationUpdate }) {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState([])
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    setNotifications(notification || [])
  }, [notification])

  // Écoute temps réel
  useEffect(() => {
    echo.private(`App.Models.User.${userId}`).notification((notif) => {
      console.log("Notif temps réel:", notif)
      setNotifications((prev) => [notif, ...prev])
    })
  }, [userId])

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

  // Trier les notifications : non lues en premier
  const sortedNotifications = [...notifications].sort((a, b) => {
    if (!a.read_at && b.read_at) return -1;
    if (a.read_at && !b.read_at) return 1;
    return 0;
  });

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    setIsDialogOpen(true);
    
    // Marquer comme lue si elle ne l'est pas déjà
    if (!notification.read_at) {
      try {
        const response = await api.get(`/notifications/${notification.id}/mark-as-read`);
        // Mettre à jour l'état local avec la notification retournée par l'API
        if (response.data && response.data.notification) {
          setNotifications(prev => 
            prev.map(n => 
              n.id === notification.id 
                ? response.data.notification
                : n
            )
          );
        } else {
          // Fallback : mettre à jour manuellement
          setNotifications(prev => 
            prev.map(n => 
              n.id === notification.id 
                ? { ...n, read_at: new Date().toISOString() }
                : n
            )
          );
        }
        // Mettre à jour aussi la notification sélectionnée
        setSelectedNotification(prev => 
          prev && prev.id === notification.id
            ? { ...prev, read_at: response.data?.notification?.read_at || new Date().toISOString() }
            : prev
        );
        
        // Notifier le parent si callback fourni
        if (onNotificationUpdate) {
          const updatedNotifications = notifications.map(n => 
            n.id === notification.id 
              ? (response.data?.notification || { ...n, read_at: new Date().toISOString() })
              : n
          );
          onNotificationUpdate(updatedNotifications);
        }
        
        // Afficher un toast de confirmation
        toast({
          title: "Notification marquée comme lue",
          description: "La notification a été marquée comme lue.",
        });
      } catch (error) {
        console.error('Error marking notification as read:', error);
        toast({
          title: "Erreur",
          description: "Impossible de marquer la notification comme lue.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {notifications?.filter(n => !n.read_at).length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {notifications?.filter(n => !n.read_at).length}
            </Badge>
          )}
          {/* <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" /> */}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-0">
        <DropdownMenuLabel className="flex items-center justify-between w-full">
          <span>Notifications</span>
          {notifications?.filter(n => !n.read_at).length > 0 && (
            <Badge variant="destructive" className="ml-2 text-xs">
              {notifications.filter(n => !n.read_at).length}
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications?.length > 0 ? (
          <>
            <ScrollArea className="h-64">
              {sortedNotifications.slice(0, 3).map((n, i) => (
                  <>
                      <DropdownMenuItem
                          key={i}
                          onClick={() => handleNotificationClick(n)}
                          className={`flex flex-col items-start p-3 rounded-lg transition-all cursor-pointer
                          ${
                          !n.read_at
                              ? "bg-primary/10 border-l-2 border-primary hover:bg-primary/20"
                              : "bg-muted/30 hover:bg-muted/50 opacity-75"
                          }`}
                      >
                          <div className="flex items-center gap-2 w-full">
                              <p className={`font-medium flex-1 ${
                                !n.read_at ? "text-foreground font-semibold" : "text-muted-foreground"
                              }`}>
                                {getMaintenanceLabel(n.data.title)}
                              </p>
                              {!n.read_at && (
                                  <Badge variant="default" className="h-2 w-2 p-0 rounded-full flex-shrink-0" />
                              )}
                          </div>
                          <p className={`text-xs mt-1 ${
                            !n.read_at ? "text-foreground" : "text-muted-foreground"
                          }`}>
                            {n.data.description}
                          </p>
                          {/* <p className="text-xs text-muted-foreground">
                          par {n.created_by}
                          </p> */}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                  </>
              ))}
            </ScrollArea>
            {notifications.length > 3 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link 
                    to="/notifications" 
                    className="flex items-center justify-center gap-2 w-full p-3 text-sm text-primary hover:text-primary/80"
                  >
                    <span>Voir toutes les notifications</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </>
        ) : (
          <div className="p-4 text-sm text-muted-foreground">
            Aucune notification pour l'instant.
          </div>
        )}
      </DropdownMenuContent>

      {/* Dialog pour afficher le contenu complet */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {selectedNotification && getMaintenanceLabel(selectedNotification.data.title)}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              {selectedNotification && new Date(selectedNotification.created_at).toLocaleString('fr-FR', {
                dateStyle: 'full',
                timeStyle: 'short',
              })}
            </DialogDescription>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="text-sm font-semibold mb-2">Description</h3>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {selectedNotification.data.description}
                </p>
              </div>
              {selectedNotification.data.details && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="text-sm font-semibold mb-2">Détails</h3>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {typeof selectedNotification.data.details === 'string' 
                      ? selectedNotification.data.details 
                      : JSON.stringify(selectedNotification.data.details, null, 2)}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between pt-4 border-t">
                <Badge variant={selectedNotification.read_at ? "outline" : "default"}>
                  {selectedNotification.read_at ? "Lue" : "Non lue"}
                </Badge>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  )
}
