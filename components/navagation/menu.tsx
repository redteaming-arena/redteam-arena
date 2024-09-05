import React, {useState, useEffect, Suspense} from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Icons from "@/public/blue-sky.webp";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { Skeleton } from "../ui/skeleton";

const components: { title: string | any; href: string; description: string }[] = [
];


export function Navigation() {
  const [isMobile, setIsMobile] = useState(false);
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // Adjust this breakpoint as needed
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const MobileNavigation = () => (
    <div className="flex flex-col w-full z-20">

      <Link href="/games" className="block py-2 px-4 ">
        Games
      </Link>
      <Link href="/leaderboard" className="block py-2 px-4 ">
        LeaderBoard
      </Link>
    </div>
  );

  const DesktopNavigation = () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Games</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <li className="relative row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="relative flex h-full w-full select-none flex-col justify-end rounded-md p-6 no-underline outline-none focus:shadow-md hover:opacity-90 duration-200"
                    href="/games/1"
                  >
                    <div className="absolute inset-0 z-1 opacity-80">
                      <Image
                        alt="blue-sky"
                        src={Icons}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                      />
                    </div>
                    <div className="w-fit left-2 mx-auto my-auto text-lg font-bold z-10 text-black bg-gradient-radial from-white to-white/90 p-2 rounded-lg shadow-md">
                      Game Demo√
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/leaderboard" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              LeaderBoard
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/jailbreaks" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Jailbreaks
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );

  return isMobile ? <MobileNavigation /> : <DesktopNavigation />;
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";