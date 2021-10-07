import { Box, BoxProps, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { usePagination, UsePaginationItem, UsePaginationResult } from "@material-ui/lab";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";
import { ReactComponent as ArrowLeft } from "./arrow-left.svg";
import { ReactComponent as ArrowRight } from "./arrow-right.svg";

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
    fontSize: 20,
    "&:hover": {
      opacity: 0.6,
      backgroundColor: "#aaaaaa",
      borderRadius: 12,
    },
    "&:not(:last-child)": {
      marginRight: theme.spacing(1),
    }
  },
  pageText: {
    padding: 8,
  },
  ellipsis: {
    marginRight: theme.spacing(1),
  },
  selected: {
    textDecoration: "underline",
    color: theme.palette.primary.dark
  }
}));

const ArkPaginator: React.FC<Props> = (props: Props) => {
  const { totalItem, itemPerPage, onPageChange, className, ...rest } = props;
  const classes = useStyles();
  const maxPages = Math.ceil(totalItem / itemPerPage);

  const { items }: UsePaginationResult = usePagination({
    count: maxPages,
    boundaryCount: 1,
    siblingCount: 0,
    defaultPage: 1,
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
        const { page, type, selected, ...item } = pageItem;
        if (type === 'start-ellipsis' || type === 'end-ellipsis') {
          return <Typography className={classes.ellipsis}>...</Typography>;
        } else if (type === 'page') {
          return (
            <Typography
              onClick={(e) => { if (!selected) onPageClicked(page, pageItem, e) }}
              className={cls(classes.clickable, classes.pageText, selected ? classes.selected : undefined)}
            >
              {page}
            </Typography>
          );
        } else if (type === 'next') {
          return (
            <ArrowRight className={cls(classes.clickable)} onClick={(e) => {
              if (selectedPage && selectedPage.page === maxPages) return;
              else item.onClick(e)
            }} />
          );
        } else if (type === 'previous') {
          return (
            <ArrowLeft className={cls(classes.clickable)} onClick={(e) => {
              if (selectedPage && selectedPage.page === 1) return;
              else item.onClick(e)
            }} />
          );
        }
        return <></>
      })}
    </Box>
  );
};

export default ArkPaginator;
