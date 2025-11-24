import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const Terms = () => {
  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary shrink-0" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Conditions d'utilisation</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Politique et conditions d'utilisation du système Bypass Guard</p>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Conditions générales d'utilisation</CardTitle>
          <CardDescription>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">1. Acceptation des conditions</h2>
              <p className="text-muted-foreground">
                En accédant et en utilisant le système Bypass Guard, vous acceptez d'être lié par ces conditions d'utilisation. 
                Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser ce système.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">2. Utilisation du système</h2>
              <p className="text-muted-foreground">
                Le système Bypass Guard est destiné à la gestion sécurisée des demandes de bypass. Vous vous engagez à :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Utiliser le système uniquement dans le cadre de vos fonctions professionnelles</li>
                <li>Respecter les procédures et protocoles de sécurité établis</li>
                <li>Fournir des informations exactes et complètes dans vos demandes</li>
                <li>Maintenir la confidentialité de vos identifiants de connexion</li>
                <li>Ne pas partager votre compte avec d'autres personnes</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">3. Responsabilités</h2>
              <p className="text-muted-foreground">
                Vous êtes responsable de toutes les activités effectuées sous votre compte. 
                L'administration se réserve le droit de suspendre ou de désactiver tout compte en cas de violation de ces conditions.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">4. Confidentialité et sécurité</h2>
              <p className="text-muted-foreground">
                Toutes les informations traitées dans ce système sont confidentielles. Vous vous engagez à :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Respecter la confidentialité des données auxquelles vous avez accès</li>
                <li>Ne pas divulguer d'informations sensibles en dehors du système</li>
                <li>Signaler immédiatement tout problème de sécurité suspecté</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">5. Modifications des conditions</h2>
              <p className="text-muted-foreground">
                L'administration se réserve le droit de modifier ces conditions à tout moment. 
                Les utilisateurs seront informés des modifications importantes par notification dans le système.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">6. Contact</h2>
              <p className="text-muted-foreground">
                Pour toute question concernant ces conditions d'utilisation, veuillez contacter l'administration du système.
              </p>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Terms;
