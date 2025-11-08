import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/user';
import { getUserPermissions } from '@/data/mockUsers';
import { 
  Shield, 
  Users, 
  Settings, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Crown,
  Wrench
} from 'lucide-react';

interface ProfileCardProps {
  user: User;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'initiator':
      return <Wrench className="h-5 w-5" />;
    case 'approver_level_1':
      return <Shield className="h-5 w-5" />;
    case 'approver_level_2':
      return <CheckCircle className="h-5 w-5" />;
    case 'director':
      return <Crown className="h-5 w-5" />;
    default:
      return <Users className="h-5 w-5" />;
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'initiator':
      return 'Initiateur';
    case 'approver_level_1':
      return 'Approbateur Niv. 1';
    case 'approver_level_2':
      return 'Approbateur Niv. 2';
    case 'director':
      return 'Directeur';
    default:
      return role;
  }
};

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'initiator':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'approver_level_1':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
    case 'approver_level_2':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'director':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

export const ProfileCard = ({ user }: ProfileCardProps) => {
  const permissions = getUserPermissions(user.role);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              {getRoleIcon(user.role)}
            </div>
            <div>
              <CardTitle className="text-lg">{user.firstName} {user.lastName}</CardTitle>
              <p className="text-sm text-muted-foreground">{user.department}</p>
            </div>
          </div>
          <Badge className={getRoleBadgeColor(user.role)}>
            {getRoleLabel(user.role)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-muted-foreground">ID Employé</p>
            <p className="font-mono">{user.employeeId}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Zone</p>
            <p>{user.zone}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Email</p>
            <p className="truncate">{user.email}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Téléphone</p>
            <p>{user.phone || 'Non défini'}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium text-sm mb-3 flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Permissions d'accès
          </h4>
          <div className="space-y-2">
            {permissions.canSubmitRequest && (
              <div className="flex items-center text-sm text-green-700 bg-green-50 px-2 py-1 rounded">
                <CheckCircle className="h-3 w-3 mr-2" />
                Soumettre des demandes
              </div>
            )}
            {permissions.canApproveLevel1 && (
              <div className="flex items-center text-sm text-orange-700 bg-orange-50 px-2 py-1 rounded">
                <Shield className="h-3 w-3 mr-2" />
                Approbation niveau 1
              </div>
            )}
            {permissions.canApproveLevel2 && (
              <div className="flex items-center text-sm text-green-700 bg-green-50 px-2 py-1 rounded">
                <CheckCircle className="h-3 w-3 mr-2" />
                Approbation niveau 2
              </div>
            )}
            {permissions.canViewAllRequests && (
              <div className="flex items-center text-sm text-blue-700 bg-blue-50 px-2 py-1 rounded">
                <FileText className="h-3 w-3 mr-2" />
                Consulter toutes les demandes
              </div>
            )}
            {permissions.canExportData && (
              <div className="flex items-center text-sm text-purple-700 bg-purple-50 px-2 py-1 rounded">
                <FileText className="h-3 w-3 mr-2" />
                Exporter les données
              </div>
            )}
            {permissions.canManageEquipment && (
              <div className="flex items-center text-sm text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
                <Settings className="h-3 w-3 mr-2" />
                Gérer les équipements
              </div>
            )}
            {permissions.canViewAuditLog && (
              <div className="flex items-center text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded">
                <FileText className="h-3 w-3 mr-2" />
                Journal d'audit
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};