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
  {
    title: "Current Games",
    href: "/games",
    description:
      "Have a browse of the current game selection.",
  },
  {
    title: <>Create Games  <span className="
    mr-3 text-xl 2xl:text-2xl inline-block -skew-x-12 rounded-lg border border-gray-200 bg-gradient-to-br from-blue-300 via-blue-200 to-blue-100 px-2 py-[.08rem] !text-sm font-bold dark:text-blue-50 shadow-lg shadow-green-500/10 dark:from-blue-700 dark:via-blue-700 dark:to-blue-600 
   ">
    Blue-Team
</span>
</>,
    href: "/build/game",
    description:
      "Building to understand better interpolate model outputs",
  },
];

        {/* <NavigationMenuItem>
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="relative row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="relative flex h-full w-full select-none flex-col justify-end rounded-md p-6 no-underline outline-none focus:shadow-md hover:opacity-90 duration-200"
                    href="/"
                  >
                    <div className="absolute inset-0 z-1 opacity-90">
                      <Image 
                        alt="blue-sky" 
                        src={Icons} 
                        layout="fill" 
                        objectFit="cover" 
                        className="rounded-md"
                      />
                    </div>
                    <div className=" w-fit mb-2 mt-2 left-2 mx-auto my-auto text-lg font-bold z-10 text-black  bg-gradient-radial from-white to-white/90 p-2 rounded-lg shadow-md">
                      Game
                    </div>
                    <p className="text-sm  font-medium leading-tight text-muted-foreground z-10">
                        BadWords
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/docs" title="Create Game">
                
              </ListItem>
              <ListItem href="/docs/installation" title="Installation">
                How to install dependencies and structure your app.
              </ListItem>
              <ListItem href="/docs/primitives/typography" title="Typography">
                Styles for headings, paragraphs, lists...etc
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem> */}



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
      <button
        onClick={() => setIsGameMenuOpen(!isGameMenuOpen)}
        className="flex justify-between items-center w-full py-2 px-4 hover:bg-black/70 z-20"
      >
        <>Games</>
        {isGameMenuOpen ? <ChevronUpIcon className="h-5 w-5 z-20" /> : <ChevronDownIcon className="h-5 w-5 z-20" />}
      </button>
      {isGameMenuOpen && (
        <div className="pl-4 z-20 animate-navigationSlideIn">
          
           <a
                    className="relative flex h-full w-full select-none flex-col justify-end rounded-md p-6 no-underline outline-none focus:shadow-md hover:opacity-90 duration-200"
                    href="/games/1"
                  >
                    <div className="absolute inset-0 z-1 opacity-80">
                    <Suspense fallback={<Skeleton className="rounded-md"/>}>
                      <Image
                        alt="blue-sky"
                        src={Icons}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                        loading="lazy"
                        placeholder="blur"
                      />
                      </Suspense>
                    </div>
                    <div className="w-fit left-2 mx-auto my-auto text-lg font-bold z-10 text-black bg-gradient-radial from-white to-white/90 p-2 rounded-lg shadow-md">
                      Game Demo
                    </div>
                  </a>
          {components.map((component) => (
            <Link key={component.title} href={component.href} className="block py-2">
              {component.title}
            </Link>
          ))}
        </div>
      )}
      <Link href="/leaderboard" className="block py-2 px-4 ">
        LeaderBoard
      </Link>
      <Link href="/jailbreaks" className="block py-2 px-4 ">
        Jailbreaks
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
                      Game Demo
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