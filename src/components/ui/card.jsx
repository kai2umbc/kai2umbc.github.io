import * as React from "react";
import {cn} from "@/lib/utils";

function Card({className, ...props}) {
    return (
        <div
            data-slot="card"
            className={cn(
                "bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm",
                className
            )}
            {...props}
        />
    );
}

function CardHeader({className, ...props}) {
    return (
        <div
            data-slot="card-header"
            className={cn("flex flex-col gap-1.5 px-4 py-3", className)}
            {...props}
        />
    );
}

function CardTitle({className, ...props}) {
    return (
        <div
            data-slot="card-title"
            className={cn("leading-none font-semibold", className)}
            {...props}
        />
    );
}

function CardDescription({className, ...props}) {
    return (
        <div
            data-slot="card-description"
            className={cn("text-muted-foreground text-sm", className)}
            {...props}
        />
    );
}

function CardContent({className, ...props}) {
    return (
        <div data-slot="card-content" className={cn("", className)} {...props} />
    );
}

function CardFooter({className, ...props}) {
    return (
        <div
            data-slot="card-footer"
            className={cn("flex items-center px-4 py-3", className)}
            {...props}
        />
    );
}

export {Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent};