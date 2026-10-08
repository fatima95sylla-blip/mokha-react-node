"use client";

import { useState } from "react";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BRAND } from "@/data/mokha";

export default function Contact() {
  const [nom, setNom] = useState("");
  const [message, setMessage] = useState("");

  const texteWhatsapp = encodeURIComponent(
    `Bonjour MOKHA, je suis ${nom || "..."}. ${message || ""}`.trim(),
  );
  const sujetMail = encodeURIComponent("Contact depuis le site MOKHA");
  const corpsMail = encodeURIComponent(`De : ${nom || "..."}\n\n${message}`);

  return (
    <section className="mx-auto max-w-[1000px] px-4 py-16 sm:px-8">
      <p className="label-xs text-gold">Nous écrire</p>
      <h1 className="mt-4 text-4xl sm:text-5xl">Contact</h1>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Écrivez-nous directement sur WhatsApp pour une réponse rapide, ou préparez un e-mail
            ci-dessous — les deux boutons ouvrent votre application avec le message déjà rempli.
          </p>

          <div className="mt-8 space-y-4">
            <div>
              <Label htmlFor="nom" className="label-xs">Votre nom</Label>
              <Input id="nom" value={nom} maxLength={100} onChange={(e) => setNom(e.target.value)} className="mt-2 rounded-none" />
            </div>
            <div>
              <Label htmlFor="message" className="label-xs">Votre message</Label>
              <Textarea
                id="message"
                rows={6}
                value={message}
                maxLength={1000}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-2 rounded-none"
                placeholder="Votre question, votre projet…"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="rounded-none">
              <a href={`https://wa.me/${BRAND.whatsapp}?text=${texteWhatsapp}`} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" className="rounded-none">
              <a href={`mailto:${BRAND.email}?subject=${sujetMail}&body=${corpsMail}`}>
                <Mail className="mr-2 h-4 w-4" /> E-mail
              </a>
            </Button>
          </div>
        </div>

        <div className="border border-border p-6">
          <p className="label-xs text-muted-foreground">Coordonnées</p>
          <ul className="mt-4 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              {BRAND.adresse}
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-gold" />
              {BRAND.phone}
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-gold" />
              {BRAND.email}
            </li>
          </ul>
          <p className="label-xs mt-6 text-gold">Horaires</p>
          <p className="mt-2 text-sm text-muted-foreground">{BRAND.horaires}</p>
        </div>
      </div>
    </section>
  );
}
