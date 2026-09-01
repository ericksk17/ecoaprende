"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Shield, Lock, Eye, Bell, Database, Trash2, UserCheck, Mail, Smartphone } from "lucide-react"

export default function PrivacyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Política de Privacidad</h1>
            <p className="text-xs opacity-80">EcoAprende</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        
        {/* Fecha */}
        <p className="text-sm text-muted-foreground">
          Última actualización: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        {/* Sección 1 */}
        <section className="bg-card rounded-xl p-5 border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="font-bold text-lg">1. Información que recopilamos</h2>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
              <span><strong className="text-foreground">Datos de cuenta:</strong> correo electrónico y nombre</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
              <span><strong className="text-foreground">Reportes ambientales:</strong> categoría, descripción, ubicación y fotos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
              <span><strong className="text-foreground">Datos de uso:</strong> interacciones dentro de la aplicación</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
              <span><strong className="text-foreground">Datos del dispositivo:</strong> modelo y versión del sistema operativo</span>
            </li>
          </ul>
        </section>

        {/* Sección 2 */}
        <section className="bg-card rounded-xl p-5 border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="font-bold text-lg">2. Cómo usamos la información</h2>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
              Proporcionar y mejorar los servicios de la aplicación
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
              Procesar y gestionar reportes ambientales
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
              Comunicarnos con usted sobre su cuenta
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
              Mejorar la experiencia del usuario
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
              Cumplir con obligaciones legales
            </li>
          </ul>
        </section>

        {/* Sección 3 */}
        <section className="bg-card rounded-xl p-5 border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="font-bold text-lg">3. Compartir información</h2>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 mb-3">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
              No vendemos sus datos personales.
            </p>
          </div>
          <p className="text-sm text-muted-foreground mb-2">Solo compartimos información cuando:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full shrink-0" />
              Usted lo autoriza explícitamente
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full shrink-0" />
              Es necesario para cumplir con la ley
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full shrink-0" />
              Para proteger los derechos y seguridad de los usuarios
            </li>
          </ul>
        </section>

        {/* Sección 4 */}
        <section className="bg-card rounded-xl p-5 border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="font-bold text-lg">4. Almacenamiento y seguridad</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Sus datos se almacenan en servidores seguros con cifrado. Implementamos medidas de seguridad para proteger su información, pero ningún sistema es 100% seguro.
          </p>
        </section>

        {/* Sección 5 */}
        <section className="bg-card rounded-xl p-5 border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
              <Smartphone className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h2 className="font-bold text-lg">5. Permisos del dispositivo</h2>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3 bg-muted/50 rounded-lg p-3">
              <span className="text-lg">📷</span>
              <div>
                <strong className="text-foreground">Cámara</strong>
                <p className="text-xs mt-0.5">Para tomar fotos en reportes ambientales</p>
              </div>
            </li>
            <li className="flex items-start gap-3 bg-muted/50 rounded-lg p-3">
              <span className="text-lg">📍</span>
              <div>
                <strong className="text-foreground">Ubicación</strong>
                <p className="text-xs mt-0.5">Para geolocalizar reportes ambientales</p>
              </div>
            </li>
            <li className="flex items-start gap-3 bg-muted/50 rounded-lg p-3">
              <span className="text-lg">🔔</span>
              <div>
                <strong className="text-foreground">Notificaciones</strong>
                <p className="text-xs mt-0.5">Para enviar actualizaciones sobre sus reportes</p>
              </div>
            </li>
          </ul>
          <p className="text-xs text-muted-foreground mt-3">
            Puede revocar estos permisos en cualquier momento desde la configuración de su dispositivo.
          </p>
        </section>

        {/* Sección 6 */}
        <section className="bg-card rounded-xl p-5 border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Trash2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="font-bold text-lg">6. Retención de datos</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Conservamos sus datos mientras su cuenta esté activa o según sea necesario para proporcionar nuestros servicios. Puede solicitar la eliminación de su cuenta y datos en cualquier momento.
          </p>
        </section>

        {/* Sección 7 */}
        <section className="bg-card rounded-xl p-5 border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
              <UserCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <h2 className="font-bold text-lg">7. Sus derechos</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["Acceder a sus datos", "Rectificar datos", "Eliminar sus datos", "Exportar sus datos", "Revocar consentimiento", "Oponerse al uso"].map((right) => (
              <div key={right} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                <span className="text-teal-500">✓</span>
                <span className="text-sm text-foreground">{right}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Sección 8 */}
        <section className="bg-card rounded-xl p-5 border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
              <Bell className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <h2 className="font-bold text-lg">8. Cambios a esta política</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Podemos actualizar esta política periódicamente. Le notificaremos sobre cambios significativos a través de la aplicación o por correo electrónico.
          </p>
        </section>

        {/* Contacto */}
        <section className="bg-card rounded-xl p-5 border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="font-bold text-lg">9. Contacto</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Para preguntas sobre privacidad, contacte a:
          </p>
          <a 
            href="mailto:soporte@ecoaprende.com" 
            className="inline-flex items-center gap-2 mt-2 text-sm font-medium text-primary hover:underline"
          >
            📧 soporte@ecoaprende.com
          </a>
        </section>

        {/* Botón volver */}
        <button
          onClick={() => router.back()}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity active:scale-[0.98]"
        >
          Volver
        </button>

        <div className="h-8" />
      </div>
    </div>
  )
}