'use client';

import Image from 'next/image';
import Link from 'next/link';
import { LogOut, User as UserIcon, CalendarPlus, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/language-context';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

export function Header() {
  const { language, setLanguage, t } = useTranslation();
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const handleLanguageChange = (checked: boolean) => {
    setLanguage(checked ? 'es' : 'en');
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/assets/LogoInnvo.png" alt="Innvo Logo" width={40} height={40} />
          <span className="font-bold text-xl text-foreground">Agendamiento Innvo</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="language-switch" className={language === 'en' ? 'font-bold text-sm' : 'text-sm'}>
              EN
            </Label>
            <Switch
              id="language-switch"
              checked={language === 'es'}
              onCheckedChange={handleLanguageChange}
              aria-label="Language switcher"
            />
            <Label htmlFor="language-switch" className={language === 'es' ? 'font-bold text-sm' : 'text-sm'}>
              ES
            </Label>
          </div>

          {user.isLoggedIn && (
            <div className="flex items-center gap-4 border-l pl-4">
               <nav className="flex items-center gap-2">
                <Link href="/">
                  <Button variant={pathname === '/' ? 'default' : 'ghost'} size="sm" className="rounded-full">
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    {t('menu_agendar')}
                  </Button>
                </Link>
                <Link href="/patients/search">
                  <Button variant={pathname === '/patients/search' ? 'default' : 'ghost'} size="sm" className="rounded-full">
                    <Search className="mr-2 h-4 w-4" />
                    {t('menu_buscarPaciente')}
                  </Button>
                </Link>
              </nav>

              <div className="flex items-center gap-2 border-l pl-4">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">{user.username}</span>
              </div>
              <Button variant="outline" size="sm" onClick={logout} className="rounded-full">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
