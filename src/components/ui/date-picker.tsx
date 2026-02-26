"use strict";

import * as React from "react";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
    date?: Date;
    setDate: (date?: Date) => void;
    className?: string;
    placeholder?: string;
}

export function DatePicker({ date, setDate, className, placeholder = "Selecione uma data" }: DatePickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal bg-goat-gray-700 border-goat-gray-600 text-white hover:bg-goat-gray-600 hover:text-white transition-all rounded-xl h-10",
                        !date && "text-white/40",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 text-goat-purple" />
                    {date && isValid(date) ? format(date, "PPP", { locale: ptBR }) : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-goat-gray-800 border-goat-gray-700 z-[9999999]" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    locale={ptBR}
                    className="bg-goat-gray-800 text-white rounded-xl w-full flex justify-center"
                />
            </PopoverContent>
        </Popover>
    );
}
