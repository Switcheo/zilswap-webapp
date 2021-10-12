import React, { useState, useEffect } from "react";
import { Box, Button, makeStyles, Popover } from "@material-ui/core";
import { AppTheme } from "app/theme/types";
import { Text } from "app/components";
import { ReactComponent as Checkmark } from "./checkmark.svg";
import { hexToRGBA } from "app/utils";
import cls from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { MarketPlaceState, RootState } from "app/store/types";
import { updateFilter } from "app/store/marketplace/actions";

export enum SortBy {
  PriceDescending,
  PriceAscending,
  RarityDescending,
  RarityAscending,
  MostRecent,
  MostLoved,
  MostViewed
}

const useStyles = makeStyles((theme: AppTheme) =>({
  button: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: "#29475A",
    color: theme.palette.type === "dark" ? "white" : "",
    fontSize: 14,
    justifyContent: "flex-start",
    padding: "12px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyItems: "center",
    position: "relative",
    marginLeft: 10
  },
  inactive: {
    borderRadius: "12px"
  },
  active: {
    borderColor: theme.palette.primary.dark,
    borderStyle: "solid",
    borderWidth: 1,
  },
  popover: {
    "& .MuiPaper-root": {
      backgroundColor: theme.palette.type === "dark" ? "#223139" : "D4FFF2",
      width: '100%',
      maxWidth: 260,
      borderRadius: "12px",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: theme.palette.type === "dark" ? "#29475A" : "#D4FFF2",
      overflow: "hidden",
      marginTop: 8
    },
  },
  popoverContainer: {
    maxHeight: 340,
    padding: "14px 0",
    "&::-webkit-scrollbar": {
      width: "0.4rem"
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: `rgba${hexToRGBA(theme.palette.type === "dark" ? "#DEFFFF" : "#003340", 0.1)}`,
      borderRadius: 12
    },
  },
  itemHeader: {
    color: theme.palette.label
  },
  bold: {
    fontWeight: "bold",
  },
  selectModifier: {
    fontSize: 12,
    paddingLeft: 20
  },
  filterLabel: {
    fontSize: 12,
    opacity: 0.5
  },
  filterValue: {
    fontSize: 16,
    fontWeight: 'bolder',
    fontFamily: 'Avenir Next',
    color: theme.palette.type === "dark" ? "white" : "black",
    textTransform: "uppercase",
    flexGrow: 1
  },
  selectedFilterValue: {
    color: theme.palette.primary.dark,
  },
  filterOption: {
    fontSize: 16,
    fontWeight: 'bolder',
    fontFamily: 'Avenir Next',
    padding: "5px 14px",
    color: theme.palette.type === "dark" ? "white" : "",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    "&:hover": {
      background: "rgba(255,255,255,0.1)"
    }
  },
  filterOptionDetail: {
    fontWeight: 'normal'
  },
  sortIcon: {
    fill: "#DEFFFF",
    fillOpacity: 0.5
  },
  sortIconMenu: {
    fill: "#DEFFFF",
    fillOpacity: 1
  },
  sortIconSelected: {
    fill: theme.palette.primary.dark,
    fillOpacity: 1
  }
}))

const SortFilter = () => {
  const marketPlaceState = useSelector<RootState, MarketPlaceState>(state => state.marketplace);
  const dispatch = useDispatch();

  const [sortBy, setSortBy] = useState<SortBy>(marketPlaceState.filter.sortBy)

  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    dispatch(updateFilter({
      ...marketPlaceState.filter,
      sortBy: sortBy
    }))
    handleClose()
    // eslint-disable-next-line
  }, [sortBy])

  const iconForType = (sortBy: SortBy): React.ReactNode => {
    if(sortBy === SortBy.PriceDescending) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.93 13.1201H15C14.7348 13.1201 14.4804 13.2255 14.2929 13.413C14.1054 13.6006 14 13.8549 14 14.1201C14 14.3853 14.1054 14.6397 14.2929 14.8272C14.4804 15.0148 14.7348 15.1201 15 15.1201H16V20.0001C16 20.2653 16.1054 20.5197 16.2929 20.7072C16.4804 20.8948 16.7348 21.0001 17 21.0001C17.2652 21.0001 17.5196 20.8948 17.7071 20.7072C17.8946 20.5197 18 20.2653 18 20.0001V14.1101C17.999 13.9735 17.97 13.8386 17.9148 13.7137C17.8596 13.5887 17.7794 13.4764 17.6792 13.3837C17.5789 13.2909 17.4607 13.2197 17.3319 13.1743C17.203 13.129 17.0663 13.1106 16.93 13.1201Z"  />
          <path d="M11.1817 17.2302H9.39169V3.66021C9.39239 3.55169 9.35296 3.44673 9.28097 3.36551C9.20898 3.28429 9.10952 3.23255 9.00169 3.22021H7.83169C7.715 3.22021 7.60308 3.26657 7.52056 3.34909C7.43805 3.4316 7.39169 3.54352 7.39169 3.66021V17.2302H5.60169C5.50161 17.2265 5.40281 17.2536 5.3186 17.3078C5.23438 17.362 5.16879 17.4407 5.13066 17.5333C5.09253 17.6259 5.08369 17.728 5.10533 17.8258C5.12697 17.9235 5.17805 18.0123 5.25169 18.0802L8.00169 20.8602C8.09684 20.9525 8.22416 21.0041 8.35669 21.0041C8.48922 21.0041 8.61654 20.9525 8.71169 20.8602L11.4917 18.0802C11.5629 18.0147 11.6131 17.9295 11.6359 17.8355C11.6588 17.7414 11.6533 17.6428 11.6201 17.5518C11.587 17.4609 11.5277 17.3819 11.4496 17.3246C11.3716 17.2674 11.2784 17.2345 11.1817 17.2302Z"  />
          <path d="M17.92 3.21993H14C13.7348 3.21993 13.4804 3.32529 13.2929 3.51282C13.1054 3.70036 13 3.95471 13 4.21993V7.21993C13 7.48515 13.1054 7.7395 13.2929 7.92704C13.4804 8.11457 13.7348 8.21993 14 8.21993H16.95V9.21993H14C13.7348 9.21993 13.4804 9.32529 13.2929 9.51282C13.1054 9.70036 13 9.95471 13 10.2199C13 10.4851 13.1054 10.7395 13.2929 10.927C13.4804 11.1146 13.7348 11.2199 14 11.2199H17.94C18.2052 11.2199 18.4596 11.1146 18.6471 10.927C18.8346 10.7395 18.94 10.4851 18.94 10.2199V4.19993C18.9374 4.0686 18.909 3.93907 18.8563 3.81874C18.8036 3.6984 18.7277 3.58963 18.633 3.49862C18.5383 3.40762 18.4266 3.33616 18.3042 3.28834C18.1819 3.24052 18.0513 3.21728 17.92 3.21993ZM16.92 6.16993H15V5.16993H17L16.92 6.16993Z"  />
        </svg>
      )
    } else if(sortBy === SortBy.PriceAscending) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.2188 5.1902H15.2188V10.1102C15.2188 10.3754 15.3241 10.6298 15.5116 10.8173C15.6992 11.0048 15.9535 11.1102 16.2187 11.1102C16.484 11.1102 16.7383 11.0048 16.9259 10.8173C17.1134 10.6298 17.2187 10.3754 17.2187 10.1102V4.2002C17.2187 3.93498 17.1134 3.68062 16.9259 3.49309C16.7383 3.30555 16.484 3.2002 16.2187 3.2002H14.2188C13.9535 3.2002 13.6992 3.30555 13.5116 3.49309C13.3241 3.68062 13.2188 3.93498 13.2188 4.2002C13.2188 4.46541 13.3241 4.71977 13.5116 4.9073C13.6992 5.09484 13.9535 5.2002 14.2188 5.2002V5.1902Z" />
          <path d="M8.49884 3.36015C8.40369 3.2679 8.27637 3.21631 8.14384 3.21631C8.01131 3.21631 7.88399 3.2679 7.78884 3.36015L4.99884 6.14015C4.92029 6.20762 4.86513 6.29825 4.84129 6.39902C4.81745 6.49979 4.82614 6.60553 4.86613 6.70105C4.90612 6.79657 4.97534 6.87697 5.06386 6.9307C5.15238 6.98444 5.25564 7.00875 5.35884 7.00015H7.14884V20.5601C7.14884 20.6179 7.16022 20.6751 7.18233 20.7285C7.20444 20.7819 7.23685 20.8304 7.27771 20.8713C7.31857 20.9121 7.36708 20.9445 7.42046 20.9667C7.47384 20.9888 7.53106 21.0001 7.58884 21.0001H8.69884C8.81647 21.0002 8.92944 20.9541 9.01355 20.8719C9.09766 20.7897 9.14622 20.6778 9.14884 20.5601V7.00015H10.9388C11.0389 7.00381 11.1377 6.97673 11.2219 6.92253C11.3062 6.86834 11.3717 6.78965 11.4099 6.69704C11.448 6.60444 11.4568 6.50238 11.4352 6.4046C11.4136 6.30681 11.3625 6.21801 11.2888 6.15015L8.49884 3.36015Z" />
          <path d="M18.1587 13.1201H14.2188C13.9535 13.1201 13.6992 13.2255 13.5116 13.413C13.3241 13.6005 13.2188 13.8549 13.2188 14.1201V17.0701C13.2188 17.3353 13.3241 17.5897 13.5116 17.7772C13.6992 17.9648 13.9535 18.0701 14.2188 18.0701H17.2187V19.0701H14.2188C13.9535 19.0701 13.6992 19.1755 13.5116 19.363C13.3241 19.5505 13.2188 19.8049 13.2188 20.0701C13.2188 20.3353 13.3241 20.5897 13.5116 20.7772C13.6992 20.9648 13.9535 21.0701 14.2188 21.0701H18.1587C18.424 21.0701 18.6783 20.9648 18.8659 20.7772C19.0534 20.5897 19.1587 20.3353 19.1587 20.0701V14.1101C19.1561 13.8466 19.0496 13.5948 18.8623 13.4095C18.6751 13.2241 18.4222 13.1201 18.1587 13.1201ZM17.1587 16.1201H15.1587V15.1201H17.1587V16.1201Z" />
        </svg>
      )
    } else if(sortBy === SortBy.RarityDescending) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.93138 18.0802L5.72138 20.8602C5.81653 20.9525 5.94385 21.0041 6.07638 21.0041C6.20891 21.0041 6.33623 20.9525 6.43138 20.8602L9.21138 18.0802C9.28502 18.0123 9.3361 17.9235 9.35774 17.8258C9.37938 17.728 9.37054 17.6259 9.33241 17.5333C9.29428 17.4407 9.22869 17.362 9.14447 17.3078C9.06026 17.2536 8.96146 17.2265 8.86138 17.2302H7.07138V3.66021C7.06876 3.54261 7.0202 3.4307 6.93609 3.34846C6.85198 3.26622 6.73901 3.22019 6.62138 3.22021H5.51138C5.39468 3.22021 5.28277 3.26657 5.20025 3.34909C5.11774 3.4316 5.07138 3.54352 5.07138 3.66021V17.2302H3.28138C3.1813 17.2265 3.0825 17.2536 2.99828 17.3078C2.91407 17.362 2.84848 17.4407 2.81035 17.5333C2.77221 17.6259 2.76337 17.728 2.78501 17.8258C2.80665 17.9235 2.85773 18.0123 2.93138 18.0802Z" />
          <path d="M20.8206 8.23014L15.7606 4.84015C15.6126 4.74126 15.4386 4.68848 15.2606 4.68848C15.0826 4.68848 14.9086 4.74126 14.7606 4.84015L9.64059 8.23014C9.51258 8.31321 9.40779 8.42745 9.33607 8.56215C9.26435 8.69685 9.22805 8.84757 9.23059 9.00014V16.0001C9.22898 16.1526 9.26568 16.3029 9.33731 16.4375C9.40895 16.572 9.51324 16.6864 9.64059 16.7701L14.8206 20.1601C14.9691 20.2578 15.1429 20.3098 15.3206 20.3098C15.4983 20.3098 15.6721 20.2578 15.8206 20.1601L20.8206 16.7701C20.9459 16.6867 21.0488 16.5737 21.1203 16.4412C21.1918 16.3087 21.2297 16.1607 21.2306 16.0101V9.00014C21.2313 8.84789 21.1942 8.69785 21.1227 8.56346C21.0511 8.42907 20.9473 8.31454 20.8206 8.23014ZM19.4506 15.0001C19.4504 15.1071 19.4238 15.2123 19.3732 15.3065C19.3227 15.4007 19.2496 15.4809 19.1606 15.5401L15.6506 17.9201C15.546 17.9915 15.4222 18.0297 15.2956 18.0297C15.1689 18.0297 15.0452 17.9915 14.9406 17.9201L11.2906 15.5401C11.2022 15.4803 11.1296 15.3999 11.0791 15.3059C11.0286 15.2118 11.0017 15.1069 11.0006 15.0001V10.0001C11.0008 9.89323 11.0274 9.78801 11.0779 9.69382C11.1285 9.59962 11.2016 9.51936 11.2906 9.46014L14.8806 7.08014C14.9862 7.00659 15.1119 6.96716 15.2406 6.96716C15.3693 6.96716 15.495 7.00659 15.6006 7.08014L19.1606 9.46014C19.2496 9.51936 19.3227 9.59962 19.3732 9.69382C19.4238 9.78801 19.4504 9.89323 19.4506 10.0001V15.0001Z" />
          <path d="M15.4816 8.82016C15.4075 8.77615 15.3229 8.75293 15.2366 8.75293C15.1504 8.75293 15.0658 8.77615 14.9916 8.82016L12.5416 10.4502C12.4819 10.4914 12.4333 10.5467 12.4002 10.6113C12.367 10.6759 12.3503 10.7476 12.3516 10.8202V14.1802C12.3505 14.2538 12.3683 14.3265 12.4033 14.3913C12.4383 14.4561 12.4894 14.5108 12.5516 14.5502L15.0016 16.1802C15.0741 16.2287 15.1594 16.2547 15.2466 16.2547C15.3339 16.2547 15.4192 16.2287 15.4916 16.1802L17.8816 14.5602C17.94 14.5199 17.9877 14.4661 18.0208 14.4035C18.0538 14.3408 18.0713 14.271 18.0716 14.2002V10.8202C18.0729 10.7476 18.0563 10.6759 18.0231 10.6113C17.99 10.5467 17.9414 10.4914 17.8816 10.4502L15.4816 8.82016Z" />
        </svg>
      )
    } else if(sortBy === SortBy.RarityAscending) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.21152 6.14015L6.42152 3.36015C6.32637 3.2679 6.19905 3.21631 6.06652 3.21631C5.93399 3.21631 5.80667 3.2679 5.71152 3.36015L2.93152 6.14015C2.85392 6.20714 2.79929 6.29678 2.77531 6.39645C2.75133 6.49612 2.75922 6.60081 2.79787 6.69576C2.83651 6.79071 2.90396 6.87116 2.99072 6.92576C3.07749 6.98036 3.17919 7.00638 3.28152 7.00015H5.07152V20.5601C5.07152 20.6179 5.0829 20.6751 5.10501 20.7285C5.12712 20.7819 5.15953 20.8304 5.20039 20.8713C5.24125 20.9121 5.28976 20.9445 5.34314 20.9667C5.39652 20.9888 5.45374 21.0001 5.51152 21.0001H6.62152C6.73915 21.0002 6.85212 20.9541 6.93623 20.8719C7.02034 20.7897 7.06891 20.6778 7.07152 20.5601V7.00015H8.86152C8.96385 7.00638 9.06555 6.98036 9.15231 6.92576C9.23908 6.87116 9.30653 6.79071 9.34517 6.69576C9.38382 6.60081 9.39171 6.49612 9.36773 6.39645C9.34375 6.29678 9.28912 6.20714 9.21152 6.14015Z" />
          <path d="M20.8206 8.23014L15.7606 4.84015C15.6126 4.74126 15.4386 4.68848 15.2606 4.68848C15.0826 4.68848 14.9086 4.74126 14.7606 4.84015L9.64059 8.23014C9.51258 8.31321 9.40779 8.42745 9.33607 8.56215C9.26435 8.69685 9.22805 8.84757 9.23059 9.00014V16.0001C9.22898 16.1526 9.26568 16.3029 9.33731 16.4375C9.40895 16.572 9.51324 16.6864 9.64059 16.7701L14.8206 20.1601C14.9691 20.2578 15.1429 20.3098 15.3206 20.3098C15.4983 20.3098 15.6721 20.2578 15.8206 20.1601L20.8206 16.7701C20.9459 16.6867 21.0488 16.5737 21.1203 16.4412C21.1918 16.3087 21.2297 16.1607 21.2306 16.0101V9.00014C21.2313 8.84789 21.1942 8.69785 21.1227 8.56346C21.0511 8.42907 20.9473 8.31454 20.8206 8.23014ZM19.4506 15.0001C19.4504 15.1071 19.4238 15.2123 19.3732 15.3065C19.3227 15.4007 19.2496 15.4809 19.1606 15.5401L15.6506 17.9201C15.546 17.9915 15.4222 18.0297 15.2956 18.0297C15.1689 18.0297 15.0452 17.9915 14.9406 17.9201L11.2906 15.5401C11.2022 15.4803 11.1296 15.3999 11.0791 15.3059C11.0286 15.2118 11.0017 15.1069 11.0006 15.0001V10.0001C11.0008 9.89323 11.0274 9.78801 11.0779 9.69382C11.1285 9.59962 11.2016 9.51936 11.2906 9.46014L14.8806 7.08014C14.9862 7.00659 15.1119 6.96716 15.2406 6.96716C15.3693 6.96716 15.495 7.00659 15.6006 7.08014L19.1606 9.46014C19.2496 9.51936 19.3227 9.59962 19.3732 9.69382C19.4238 9.78801 19.4504 9.89323 19.4506 10.0001V15.0001Z" />
          <path d="M15.4816 8.82016C15.4075 8.77615 15.3229 8.75293 15.2366 8.75293C15.1504 8.75293 15.0658 8.77615 14.9916 8.82016L12.5416 10.4502C12.4819 10.4914 12.4333 10.5467 12.4002 10.6113C12.367 10.6759 12.3503 10.7476 12.3516 10.8202V14.1802C12.3505 14.2538 12.3683 14.3265 12.4033 14.3913C12.4383 14.4561 12.4894 14.5108 12.5516 14.5502L15.0016 16.1802C15.0741 16.2287 15.1594 16.2547 15.2466 16.2547C15.3339 16.2547 15.4192 16.2287 15.4916 16.1802L17.8816 14.5602C17.94 14.5199 17.9877 14.4661 18.0208 14.4035C18.0538 14.3408 18.0713 14.271 18.0716 14.2002V10.8202C18.0729 10.7476 18.0563 10.6759 18.0231 10.6113C17.99 10.5467 17.9414 10.4914 17.8816 10.4502L15.4816 8.82016Z" />
        </svg>
      )
    } else if(sortBy === SortBy.MostLoved) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 3V12C7 12.55 7.45 13 8 13H10V20.15C10 20.66 10.67 20.84 10.93 20.4L16.12 11.5C16.51 10.83 16.03 10 15.26 10H13L15.49 3.35C15.74 2.7 15.26 2 14.56 2H8C7.45 2 7 2.45 7 3Z" />
        </svg>
      )
    } else if(sortBy === SortBy.MostRecent) {
      return (
        <svg width="23" height="23" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.7069 2.87493C7.82902 2.74076 3.83277 6.66034 3.83277 11.4999H2.11736C1.68611 11.4999 1.47527 12.0174 1.78194 12.3145L4.45569 14.9978C4.64736 15.1895 4.94444 15.1895 5.13611 14.9978L7.80986 12.3145C8.10694 12.0174 7.89611 11.4999 7.46486 11.4999H5.74944C5.74944 7.76243 8.79694 4.74368 12.5536 4.79159C16.1186 4.83951 19.1182 7.83909 19.1661 11.4041C19.214 15.1512 16.1953 18.2083 12.4578 18.2083C10.9149 18.2083 9.48694 17.6812 8.35611 16.7899C7.97277 16.4928 7.43611 16.5216 7.09111 16.8666C6.68861 17.2691 6.71736 17.9495 7.16777 18.2945C8.62444 19.4445 10.4549 20.1249 12.4578 20.1249C17.2974 20.1249 21.2169 16.1287 21.0828 11.2508C20.9582 6.75618 17.2015 2.99951 12.7069 2.87493ZM12.2182 7.66659C11.8253 7.66659 11.4994 7.99243 11.4994 8.38534V11.912C11.4994 12.2474 11.6815 12.5637 11.969 12.7362L14.959 14.5091C15.304 14.7103 15.7449 14.5953 15.9461 14.2599C16.1474 13.9149 16.0324 13.4741 15.6969 13.2728L12.9369 11.6341V8.37576C12.9369 7.99243 12.6111 7.66659 12.2182 7.66659Z" />
        </svg>
      )
    } else if(sortBy === SortBy.MostViewed) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.5 7C8.09091 7 5.17955 9.07333 4 12C5.17955 14.9267 8.09091 17 11.5 17C14.9091 17 17.8205 14.9267 19 12C17.8205 9.07333 14.9091 7 11.5 7ZM11.5 15.3333C9.61818 15.3333 8.09091 13.84 8.09091 12C8.09091 10.16 9.61818 8.66667 11.5 8.66667C13.3818 8.66667 14.9091 10.16 14.9091 12C14.9091 13.84 13.3818 15.3333 11.5 15.3333ZM11.5 10C10.3682 10 9.45455 10.8933 9.45455 12C9.45455 13.1067 10.3682 14 11.5 14C12.6318 14 13.5455 13.1067 13.5455 12C13.5455 10.8933 12.6318 10 11.5 10Z" />
        </svg>
      )
    }

    return (<></>)
  }

  return (
    <>
      <Button onClick={handleClick} className={anchorEl === null ? cls(classes.button, classes.inactive) : cls(classes.button, classes.active)}>
        <Box display="flex" alignItems="center" justifyContent="center" width="100%" height="100%" className={cls(classes.sortIconMenu, {
          [classes.sortIconSelected]: anchorEl !== null
        })}>
          {iconForType(sortBy)}
        </Box>
      </Button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        className={classes.popover}
      >
        <Box paddingX="24px" className={classes.popoverContainer}>
          <Box className={classes.filterOption} onClick={() => setSortBy(SortBy.PriceDescending)}>
            <Box marginRight={1} className={cls(classes.sortIcon, {[classes.sortIconSelected]: sortBy === SortBy.PriceDescending})}>{iconForType(SortBy.PriceDescending)}</Box>
            <Box flexGrow={1}>
              <Text className={cls(classes.filterValue, {
                [classes.selectedFilterValue]: sortBy === SortBy.PriceDescending
              })}>Price High - Low</Text>
            </Box>
            {sortBy === SortBy.PriceDescending &&
              <Checkmark />
            }
          </Box>
          <Box className={classes.filterOption} onClick={() => setSortBy(SortBy.PriceAscending)}>
            <Box marginRight={1} className={cls(classes.sortIcon, {[classes.sortIconSelected]: sortBy === SortBy.PriceAscending})}>{iconForType(SortBy.PriceAscending)}</Box>
            <Box flexGrow={1}>
              <Text className={cls(classes.filterValue, {
                [classes.selectedFilterValue]: sortBy === SortBy.PriceAscending
              })}>Price Low - High</Text>
            </Box>
            {sortBy === SortBy.PriceAscending &&
              <Checkmark />
            }
          </Box>
          <Box className={classes.filterOption} onClick={() => setSortBy(SortBy.RarityDescending)}>
            <Box marginRight={1} className={cls(classes.sortIcon, {[classes.sortIconSelected]: sortBy === SortBy.RarityDescending})}>{iconForType(SortBy.RarityDescending)}</Box>
            <Box flexGrow={1}>
              <Text className={cls(classes.filterValue, {
                [classes.selectedFilterValue]: sortBy === SortBy.RarityDescending
              })}>Rarity High - Low</Text>
            </Box>
            {sortBy === SortBy.RarityDescending &&
              <Checkmark />
            }
          </Box>
          <Box className={classes.filterOption} onClick={() => setSortBy(SortBy.RarityAscending)}>
            <Box marginRight={1} className={cls(classes.sortIcon, {[classes.sortIconSelected]: sortBy === SortBy.RarityAscending})}>{iconForType(SortBy.RarityAscending)}</Box>
            <Box flexGrow={1}>
              <Text className={cls(classes.filterValue, {
                [classes.selectedFilterValue]: sortBy === SortBy.RarityAscending
              })}>Rarity Low - High</Text>
            </Box>
            {sortBy === SortBy.RarityAscending &&
              <Checkmark />
            }
          </Box>
          <Box className={classes.filterOption} onClick={() => setSortBy(SortBy.MostRecent)}>
            <Box marginRight={1} className={cls(classes.sortIcon, {[classes.sortIconSelected]: sortBy === SortBy.MostRecent})}>{iconForType(SortBy.MostRecent)}</Box>
            <Box flexGrow={1}>
              <Text className={cls(classes.filterValue, {
                [classes.selectedFilterValue]: sortBy === SortBy.MostRecent
              })}>Most Recent</Text>
            </Box>
            {sortBy === SortBy.MostRecent &&
              <Checkmark />
            }
          </Box>
          <Box className={classes.filterOption} onClick={() => setSortBy(SortBy.MostLoved)}>
            <Box marginRight={1} className={cls(classes.sortIcon, {[classes.sortIconSelected]: sortBy === SortBy.MostLoved})}>{iconForType(SortBy.MostLoved)}</Box>
            <Box flexGrow={1}>
              <Text className={cls(classes.filterValue, {
                [classes.selectedFilterValue]: sortBy === SortBy.MostLoved
              })}>Most Loved</Text>
            </Box>
            {sortBy === SortBy.MostLoved &&
              <Checkmark />
            }
          </Box>
          <Box className={classes.filterOption} onClick={() => setSortBy(SortBy.MostViewed)}>
            <Box marginRight={1} className={cls(classes.sortIcon, {[classes.sortIconSelected]: sortBy === SortBy.MostViewed})}>{iconForType(SortBy.MostViewed)}</Box>
            <Box flexGrow={1}>
              <Text className={cls(classes.filterValue, {
                [classes.selectedFilterValue]: sortBy === SortBy.MostViewed
              })}>Most Viewed</Text>
            </Box>
            {sortBy === SortBy.MostViewed &&
              <Checkmark />
            }
          </Box>
        </Box>
      </Popover>
    </>
  )
}

export default SortFilter