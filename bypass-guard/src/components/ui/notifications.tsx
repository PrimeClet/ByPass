import { useEffect, useState } from "react"
import echo from "../../utils/echo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function Tinting({ userId, notification }) {
  const [notifications, setNotifications] = useState([])

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {notifications?.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {notifications?.length}
            </Badge>
          )}
          {/* <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" /> */}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-0">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications?.length > 0 ? (
          <ScrollArea className="h-64">
            {notifications.map((n, i) => (
                <>
                    <DropdownMenuItem
                        key={i}
                        className={`flex flex-col items-start p-3 rounded-lg hover:bg-muted transition
                        ${
                        !n.read_at
                            ? "hover:bg-primary/20"
                            : "hover:bg-muted"
                        }`}
                    >
                        <p className="font-medium">{getMaintenanceLabel(n.data.title)}
                            {!n.read_at && (
                                <span className="w-3 h-3 rounded-full bg-primary mt-2" />
                            )}
                        </p>
                        <p className="text-xs text-muted-foreground">{n.data.description}</p>
                        {/* <p className="text-xs text-muted-foreground">
                        par {n.created_by}
                        </p> */}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                </>
              

            ))}
          </ScrollArea>
        ) : (
          <div className="p-4 text-sm text-muted-foreground">
            Aucune notification pour l’instant.
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
