'use client';

import * as React from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/contexts/language-context';

interface CountryOption {
    id: string;
    code: string;
    nameES: string;
    nameEN: string;
    flag: string;
}

const COUNTRIES: CountryOption[] = [
    { id: 'mx', code: '52', nameES: 'México', nameEN: 'Mexico', flag: '🇲🇽' },
    { id: 'us', code: '1', nameES: 'Estados Unidos', nameEN: 'United States', flag: '🇺🇸' },
    { id: 'ca', code: '1', nameES: 'Canadá', nameEN: 'Canada', flag: '🇨🇦' },
    { id: 'gt', code: '502', nameES: 'Guatemala', nameEN: 'Guatemala', flag: '🇬🇹' },
    { id: 'sv', code: '503', nameES: 'El Salvador', nameEN: 'El Salvador', flag: '🇸🇻' },
    { id: 'hn', code: '504', nameES: 'Honduras', nameEN: 'Honduras', flag: '🇭🇳' },
    { id: 'ni', code: '505', nameES: 'Nicaragua', nameEN: 'Nicaragua', flag: '🇳🇮' },
    { id: 'cr', code: '506', nameES: 'Costa Rica', nameEN: 'Costa Rica', flag: '🇨🇷' },
    { id: 'pa', code: '507', nameES: 'Panamá', nameEN: 'Panama', flag: '🇵🇦' },
    { id: 'co', code: '57', nameES: 'Colombia', nameEN: 'Colombia', flag: '🇨🇴' },
    { id: 've', code: '58', nameES: 'Venezuela', nameEN: 'Venezuela', flag: '🇻🇪' },
    { id: 'ec', code: '593', nameES: 'Ecuador', nameEN: 'Ecuador', flag: '🇪🇨' },
    { id: 'pe', code: '51', nameES: 'Perú', nameEN: 'Peru', flag: '🇵🇪' },
    { id: 'cl', code: '56', nameES: 'Chile', nameEN: 'Chile', flag: '🇨🇱' },
    { id: 'ar', code: '54', nameES: 'Argentina', nameEN: 'Argentina', flag: '🇦🇷' },
    { id: 'br', code: '55', nameES: 'Brasil', nameEN: 'Brazil', flag: '🇧🇷' },
    { id: 'es', code: '34', nameES: 'España', nameEN: 'Spain', flag: '🇪🇸' },
    { id: 'de', code: '49', nameES: 'Alemania', nameEN: 'Germany', flag: '🇩🇪' },
    { id: 'fr', code: '33', nameES: 'Francia', nameEN: 'France', flag: '🇫🇷' },
];

interface CountryCodeSelectProps {
    value: string; // This is the country code (e.g., "52", "1")
    onChange: (value: string) => void; // This returns the country code
    className?: string;
    disabled?: boolean;
}

export function CountryCodeSelect({
    value,
    onChange,
    className,
    disabled = false,
}: CountryCodeSelectProps) {
    const { language } = useTranslation();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [isOpen, setIsOpen] = React.useState(false);

    // Find the country by code, defaulting to the first one with that code
    const selectedCountry = COUNTRIES.find((c) => c.code === value);

    // Convert code to id for internal Select value (use first match)
    const internalValue = selectedCountry?.id || 'mx';

    const filteredCountries = React.useMemo(() => {
        if (!searchTerm) return COUNTRIES;

        const term = searchTerm.toLowerCase();
        return COUNTRIES.filter((country) => {
            const name = language === 'es' ? country.nameES : country.nameEN;
            return (
                name.toLowerCase().includes(term) ||
                country.code.includes(term)
            );
        });
    }, [searchTerm, language]);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setSearchTerm('');
        }
    };

    const handleValueChange = (countryId: string) => {
        const country = COUNTRIES.find((c) => c.id === countryId);
        if (country) {
            onChange(country.code);
        }
    };

    return (
        <Select
            value={internalValue}
            onValueChange={handleValueChange}
            disabled={disabled}
            open={isOpen}
            onOpenChange={handleOpenChange}
        >
            <SelectTrigger className={cn('w-full', className)} aria-label="Código de país">
                <SelectValue>
                    {selectedCountry && (
                        <span className="flex items-center gap-2">
                            <span>{selectedCountry.flag}</span>
                            <span className="font-medium">+{selectedCountry.code}</span>
                        </span>
                    )}
                </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
                <div className="flex items-center border-b px-3 pb-2 pt-2 sticky top-0 bg-popover z-10">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <Input
                        placeholder={language === 'es' ? 'Buscar país...' : 'Search country...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
                <SelectGroup className="p-1">
                    {filteredCountries.length > 0 ? (
                        filteredCountries.map((country) => {
                            const name = language === 'es' ? country.nameES : country.nameEN;

                            return (
                                <SelectItem
                                    key={country.id}
                                    value={country.id}
                                    className="cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{country.flag}</span>
                                        <span className="flex-1">{name}</span>
                                        <span className="text-muted-foreground text-sm">+{country.code}</span>
                                    </div>
                                </SelectItem>
                            );
                        })
                    ) : (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            {language === 'es' ? 'No se encontraron países' : 'No countries found'}
                        </div>
                    )}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
