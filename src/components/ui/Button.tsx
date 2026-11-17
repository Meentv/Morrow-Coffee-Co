import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import type { LinkProps } from "react-router-dom";

import { cn } from "@/lib/utils";

/**
 * The single button primitive. Renders a <button>, a router <a>, or an external
 * <a> depending on props — so the visual treatment never has to be duplicated,
 * and we never ship a <button> that pretends to be a link (or vice versa).
 */

export type ButtonVariant = "primary" | "secondary" | "soft" | "gold";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full border border-transparent font-semibold tracking-[-0.01em] whitespace-nowrap cursor-pointer transition-[transform,background-color,color,border-color,box-shadow] duration-250 ease-brand hover:-translate-y-0.5 hover:shadow-card-soft active:translate-y-0 disabled:pointer-events-none disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-espresso text-cream hover:bg-gold hover:text-espresso",
  secondary: "bg-cream text-espresso border-line hover:bg-cream-2",
  soft: "bg-espresso/7 text-espresso hover:bg-espresso/13",
  gold: "bg-gold text-espresso hover:bg-cream",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-[13px]",
  md: "px-[23px] py-[13px] text-sm",
  lg: "px-7 py-4 text-[15px]",
};

export type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  /** Renders a leading/trailing glyph. Decorative — hidden from AT. */
  trailing?: ReactNode;
  leading?: ReactNode;
  fullWidth?: boolean;
};

type ButtonAsButton = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    to?: undefined;
    href?: undefined;
  };

type ButtonAsRouterLink = ButtonBaseProps &
  Omit<LinkProps, "className" | "children" | "to"> & {
    to: LinkProps["to"];
    href?: undefined;
  };

type ButtonAsAnchor = ButtonBaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href"> & {
    href: string;
    to?: undefined;
  };

export type ButtonProps = ButtonAsButton | ButtonAsRouterLink | ButtonAsAnchor;

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(props, ref) {
    const {
      variant = "primary",
      size = "md",
      className,
      children,
      trailing,
      leading,
      fullWidth,
      ...rest
    } = props;

    const classes = cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className);

    const content = (
      <>
        {leading ? (
          <span aria-hidden="true" className="text-[1.05em] leading-none">
            {leading}
          </span>
        ) : null}
        {children}
        {trailing ? (
          <span aria-hidden="true" className="text-[1.05em] leading-none">
            {trailing}
          </span>
        ) : null}
      </>
    );

    if ("to" in props && props.to !== undefined) {
      const { to, ...linkRest } = rest as ButtonAsRouterLink;
      return (
        <Link ref={ref as React.Ref<HTMLAnchorElement>} to={to} className={classes} {...linkRest}>
          {content}
        </Link>
      );
    }

    if ("href" in props && props.href !== undefined) {
      const { href, ...anchorRest } = rest as ButtonAsAnchor;
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={classes}
          {...anchorRest}
        >
          {content}
        </a>
      );
    }

    const buttonRest = rest as ButtonAsButton;
    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} className={classes} {...buttonRest}>
        {content}
      </button>
    );
  },
);
