"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function AccordionJailbreak() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-0">
        <AccordionTrigger>Do we share our jailbreaks to big companies?</AccordionTrigger>
        <AccordionContent>
          No, we do not. We are a small, dedicated team focused on understanding these models. Our goal is to foster a community where knowledge can be shared openly, helping everyone better understand these models for themselves.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-1">
        <AccordionTrigger>What is model jailbreaking?</AccordionTrigger>
        <AccordionContent>
          Model jailbreaking involves removing restrictions or limitations imposed by a model's provider, allowing users to gain access to features, functionalities, or customizations that are otherwise restricted.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>What are the benefits of model jailbreaking?</AccordionTrigger>
        <AccordionContent>
          Benefits of model jailbreaking can include greater control over the model's features, customization options, and the ability to use third-party tools or applications that are not officially supported.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>What risks are associated with model jailbreaking?</AccordionTrigger>
        <AccordionContent>
          Risks of model jailbreaking include potential security vulnerabilities, instability, and the possibility of voiding warranties or breaching terms of service agreements. It's important to weigh these risks before proceeding.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
