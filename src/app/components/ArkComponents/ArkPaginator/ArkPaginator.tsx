import React from "react";
import { Box, BoxProps, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { UsePaginationItem, UsePaginationResult, usePagination } from "@material-ui/lab";
import cls from "classnames";
import ArrowLeft from "@material-ui/icons/ArrowBack";
import ArrowRight from "@material-ui/icons/ArrowForward";
import { AppTheme } from "app/theme/types";

interface Props extends BoxProps {
  totalItem: number,
  itemPerPage: number,
  onPageChange?: (pageNumber: number) => void,
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  clickable: {
    cursor: "pointer",
    "&:hover": {
      opacity: 0.6,
      backgroundColor: "#aaaaaa",
      borderRadius: 12,
    },
    "&:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
    fontFamily: "'Raleway', sans-serif",
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "bold",
  },
  pageText: {
    padding: 8,
  },
  ellipsis: {
    marginRight: theme.spacing(1),
  },
  selected: {
    // textDecoration: "underline",
    color: theme.palette.primary.dark
  },
}));

const ArkPaginator: React.FC<Props> = (props: Props) => {
  const { totalItem, itemPerPage, onPageChange, className, ...rest } = props;
  const classes = useStyles();
  const maxPages = Math.ceil(totalItem / itemPerPage);

  const { items }: UsePaginationResult = usePagination({
    count: maxPages,
  })

  const selectedPage = items.find((item) => item.selected);

  const onPageClicked = (pageNumber: number, item: UsePaginationItem, event: React.SyntheticEvent) => {
    if (onPageChange) {
      onPageChange(pageNumber);
    }
    item.onClick(event)
  }

  if (totalItem <= itemPerPage) return <></>

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      {items.map((pageItem, index) => {
        const { page, type, selected } = pageItem;
        if (type === 'start-ellipsis' || type === 'end-ellipsis') {
          return <Typography key={type} className={classes.ellipsis}>...</Typography>;
        } else if (type === 'page') {
          return (
            <Typography
              key={page}
              onClick={(e) => { if (!selected) onPageClicked(page, pageItem, e) }}
              className={cls(classes.clickable, classes.pageText, selected ? classes.selected : undefined)}
            >
              {page}
            </Typography>
          );
        } else if (type === 'next') {
          return (
            <ArrowRight key="next" className={cls(classes.clickable)} onClick={(e) => {
              if (selectedPage && selectedPage.page === maxPages) return;
              else onPageClicked(page, pageItem, e)
            }} />
          );
        } else if (type === 'previous') {
          return (
            <ArrowLeft key="previous" className={cls(classes.clickable)} onClick={(e) => {
              if (selectedPage && selectedPage.page === 1) return;
              else onPageClicked(page, pageItem, e)
            }} />
          );
        }
        return <></>
      })}
    </Box>
  );
};

export default ArkPaginator;
