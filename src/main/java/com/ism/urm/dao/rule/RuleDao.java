package com.ism.urm.dao.rule;

import java.util.ArrayList;
import java.util.List;

import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Disjunction;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Restrictions;

import com.ism.urm.dao.BasicDao;
import com.ism.urm.vo.PagingResult;
import com.ism.urm.vo.RelationOp;
import com.ism.urm.vo.RelationOp.AddType;
import com.ism.urm.vo.rule.RuleVo;

public abstract class RuleDao<T extends RuleVo> extends BasicDao<T> {

    public RuleDao() {
       // TODO Auto-generated constructor stub
    }

    public T get(Session session, String id) throws Exception {
        T rtn = getById(session, id);
        setChild(session, rtn);
        return rtn;
    }

    public PagingResult<T> searchPage(Session session, int page, int size, List<RelationOp> filter) {
        PagingResult<T> ret = new PagingResult<T>();
        ret.setPageSize(Integer.valueOf(0));
        ret.setCurPage(page);
        if (size <= 0) {
            size = 30;
        }

        Criteria critCount = session.createCriteria(entityName);
        if (filter != null) {
            Disjunction or = Restrictions.disjunction();
            for (RelationOp op : filter) {
                if (op.addType == AddType.AND) {
                    critCount.add(op.getCriterion());
                } else if (op.addType == AddType.OR) {
                    or.add(op.getCriterion());
                }
            }
            critCount.add(or);
        }
        long totalCount = ((Number) critCount.setProjection(Projections.rowCount()).uniqueResult()).longValue();
        ret.setTotalCount(totalCount);

        if (totalCount > 0) {
            int mod = (int)(totalCount % size);
            int div = (int)(totalCount / size);

            if (mod == 0) {
                ret.setPageSize(div);
            } else {
                ret.setPageSize(div + 1);
            }

            Criteria crit = session.createCriteria(entityName);
            if (filter != null) {
                Disjunction or = Restrictions.disjunction();
                for (RelationOp op : filter) {
                    if (op.addType == AddType.AND) {
                        crit.add(op.getCriterion());
                    } else if (op.addType == AddType.OR) {
                        or.add(op.getCriterion());
                    }
                }
                crit.add(or);
            }
            
            crit.setFirstResult((page - 1) * size);
            crit.setMaxResults(size);
            
            crit.addOrder(Order.desc("chgDate"));
            
            List<T> list = crit.list();
            if (list == null) {
                list = new ArrayList<>();
            }
            ret.setList(list);
        }
        session.flush();
        session.clear();
        return ret;
    }

    @Override
    public void save(Session session, T vo) throws Exception {
        beforeSave(session, vo);
        session.saveOrUpdate(entityName, vo);
        saveChild(session, vo);
    }

    public abstract String createId(Session session) throws Exception;
    protected abstract void setChild(Session session, T vo) throws Exception;
    protected abstract void beforeSave(Session session, T vo) throws Exception;
    protected abstract void saveChild(Session session, T vo) throws Exception;
}
